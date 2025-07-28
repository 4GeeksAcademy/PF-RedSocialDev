"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Post, Comments, Level, Stack, Likes, Favorites
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from api.utils import send_email
from functools import wraps
from datetime import datetime, UTC
import stripe
from openai import OpenAI
import re
import logging

api = Blueprint('api', __name__)
bcrypt = Bcrypt()
# Allow CORS requests to this API
CORS(api)

# -------------------------Decorator Administrator------------------------


def admin_required(fn):
    """
    Versión simplificada que no inyecta el admin
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user:
                return jsonify({"error": "Usuario no encontrado"}), 404

            if not user.is_admin:
                return jsonify({"error": "Se requieren privilegios de administrador"}), 403

            return fn(*args, **kwargs)  # <-- Sin inyectar parámetros

        except Exception as e:
            return jsonify({"error": "Error de autorización", "details": str(e)}), 401

    return wrapper

# ------------------------Routes for Hello World------------------------


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200
# ------------------------Routes for user registration and authentication------------------------


@api.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    last_name = data.get('last_name')
    username = data.get('username')

    # Solo esta línea adicional para convertir a booleano
    is_admin = True if str(data.get('is_admin', 'False')
                           ).lower() == 'true' else False

    if not all([email, password, name, last_name, username]):
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(
        email=email,
        password=hashed_password,
        name=name,
        last_name=last_name,
        username=username,
        is_admin=is_admin,
        stack=Stack[data.get('stack').upper()] if data.get('stack') else None,
        level=Level[data.get('level').upper()] if data.get('level') else None,
        member_since=datetime.now(UTC)
    )

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=new_user.id)

    return jsonify({
        "message": "User registered successfully",
        "token": access_token,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username,
            "is_admin": new_user.is_admin,
            "stack": new_user.stack.name if new_user.stack else None,
            "level": new_user.level.name if new_user.level else None
        }
    }), 201

# ------------------------Routes for Contacts us------------------------


@api.route('/contact', methods=['POST'])
def handle_contact():
    data = request.get_json()
    fullname = data.get('fullname')  # that's the actual front-end variable
    email = data.get('email')
    subject = data.get('subject')  # this one was missing
    message = data.get('message')

    if not all([fullname, email, subject, message]):
        return jsonify({"error": "All fields are required"}), 400
    # this part was missing (cause you didn't have utils.py before)
    try:
        send_email(
            sender=email,
            subject=subject,
            user_message=message
        )
        response_body = {
            "message": "Thank you for contacting GitWise! We will get back to you as soon as possible."
        }
        return jsonify(response_body), 200

    except Exception as error:
        print("Could not send email:", error)
        print("Error arguments:", error.args)
        return jsonify({"error": "Failed to send message"}), 500

# ------------------------Routes for user login------------------------
# Ruta de login: permite a un usuario autenticarse y obtener sus datos + token


@api.route('/login', methods=['POST'])
def login_user():
    # Obtiene datos enviados desde el frontend
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Validación básica: email y password obligatorios
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Busca el usuario por email
    user = User.query.filter_by(email=email).first()

    # Verifica existencia y contraseña válida
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Crea token JWT para sesión segura
    access_token = create_access_token(identity=str(user.id))

    # CAMBIO - Generar lista real de posts (my_posts)
    # Recorre la relación "user.say" (posts creados por el usuario)
    my_posts = [
        {
            "id": post.id,
            # Si no tiene título, muestra texto alternativo
            "title": post.title or "(No title)"
        }
        # user.say es la relación User -> Post (one-to-many)
        for post in user.say
    ]

    # CAMBIO - Generar lista real de favoritos (favorites)
    # Extrae IDs de post desde relación "user.star" (favorites)
    # user.star es User -> Favorites
    favorites = [fav.post_id for fav in user.star]

    # CAMBIO - Preparar objeto JSON con toda la info real del usuario.
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": user.name,
        "last_name": user.last_name,
        # Imagen que se puede modificar despues
        "avatar_url": "https://avatars.githubusercontent.com/u/000000?v=4",
        "join_date": user.member_since.isoformat(),    # Fecha de registro exacta
        "is_admin": user.is_admin,
        # Posts reales asociados al usuario.
        "my_posts": my_posts,
        # Favoritos reales (IDs de posts)
        "favorites": favorites,
        "stack": user.stack.name if user.stack else None,
        "level": user.level.name if user.level else None
    }

    # Retorna token + datos del usuario al frontend
    return jsonify({
        "message": "Login successful",
        "token": access_token,      # Token JWT
        "user": user_data           # Todos los datos del usuario
    }), 200


# ------------------------Routes for New Post------------------------
@api.route('/user/post/<int:user_id>', methods=['POST'])
@jwt_required()
def handle_new_post(user_id):
    try:
        # Verificar que el usuario del token coincide con el user_id
        current_user_id = get_jwt_identity()
        if int(current_user_id) != user_id:
            return jsonify({"error": "No autorizado"}), 403

        # Resto de tu lógica...
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        repo_URL = data.get('repo_URL')

        if not all([title, description, repo_URL]):
            return jsonify({"error": "Faltan campos requeridos"}), 400

        new_post = Post(
            user_id=user_id,  # Usamos el user_id de la URL
            title=title,
            description=description,
            repo_URL=repo_URL,
            image_URL=data.get('image_URL')
        )

        db.session.add(new_post)
        db.session.commit()

        return jsonify({"message": "Post creado", "post": new_post.serialize()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ------------------------Routes for Smart Search------------------------


@api.route('/smart-search', methods=['POST'])
@jwt_required()
def smart_search():
    try:
        data = request.get_json()
        user_request = data.get("user_request")
        # opcional, ya tenemos info de opcional en la def al final de routes.py
        user_tags = data.get("user_tags")

        if not user_request:
            return jsonify({"error": "User request is required"}), 400

        # para que traiga los posts candidatos
        posts = Post.query.all()
        post_results_list = "\n".join([
            f"ID: {post.id} | Title: {post.title or '[Untitled]'} | Description: {post.description}"
            for post in posts
        ])

        # para llamar a OpenAI
        ai_response = AI_search(user_request, post_results_list, user_tags)

        return jsonify(ai_response), 200
    except Exception as error:
        logger.error(f"API call failed: {error}")
        return jsonify({"error": str(error)}), 500

# ------------------------Routes for comments a post------------------------


@api.route('/post/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def handle_comments(post_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')
    text = data.get('text')

    if not text:
        return jsonify({"msg": "Text is required"}), 400

    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "Post not found"}), 404

    comments = Comments(
        user_id=user_id,
        post_id=post_id,
        title=title,
        text=text
    )
    db.session.add(comments)
    db.session.commit()

    return jsonify({"msg": "Comment added successfully", "comment": comments.serialize()}), 201


# ------------------------Routes for Get, Edit and Delete Post by ID------------------------
@api.route('/post/<int:post_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_post_by_id(post_id):
    # GET: Return post. PUT: Update post. DELETE: Delete post.
    # verify if the post exists
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "Post not found"}), 404

    # verify if the user is the owner of the post
    user_id = get_jwt_identity()
    if post.user_id != int(user_id):
        return jsonify({"msg": "You are not the owner of this post"}), 403

    # Handle GET, PUT, DELETE methods for the post
    if request.method == 'GET':
        return jsonify({"post": post.serialize()}), 200

    elif request.method == 'PUT':
        # Update the post with the provided data
        data = request.get_json()
        if not data:
            return jsonify({"msg": "No data provided"}), 400
        try:
            post.title = data.get('title', post.title)
            post.image_URL = data.get('image_URL', post.image_URL)
            post.description = data.get('description', post.description)
            post.repo_URL = data.get('repo_URL', post.repo_URL)
            db.session.commit()
            return jsonify({"msg": "Post updated successfully", "post": post.serialize()}), 200
        except KeyError as e:
            db.session.rollback()
            return jsonify({"msg": f"Server error: {str(e)}"}), 500
    # DELETE method to remove the post
    elif request.method == 'DELETE':
        try:
            db.session.delete(post)
            db.session.commit()
            return jsonify({"msg": "Post deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": f"Server error: {str(e)}"}), 500

# ------------------- Route GET and PUT user Profile--------------------------------------------


@api.route('/users/profile/<int:user_id>', methods=['GET', 'PUT'])
@jwt_required()
def handle_user_profile(user_id):
    try:
        # Verificación de identidad
        current_user_id = get_jwt_identity()
        if int(current_user_id) != user_id:
            return jsonify({"error": "Unauthorized access"}), 403

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if request.method == 'GET':
            return jsonify(user.serialize()), 200

        elif request.method == 'PUT':
            if not request.is_json:
                return jsonify({"error": "Request must be JSON"}), 400

            data = request.get_json()

            # Validar campos enum
            if 'level' in data:
                try:
                    data['level'] = Level[data['level'].upper()]
                except KeyError:
                    valid_levels = [e.name.lower() for e in Level]
                    return jsonify({
                        "error": f"Invalid level. Valid options: {valid_levels}"
                    }), 400

            if 'stack' in data:
                try:
                    data['stack'] = Stack[data['stack'].upper()]
                except KeyError:
                    valid_stacks = [e.name.lower() for e in Stack]
                    return jsonify({
                        "error": f"Invalid stack. Valid options: {valid_stacks}"
                    }), 400

            # Actualizar campos permitidos
            update_fields = ['email', 'name',
                             'last_name', 'username', 'stack', 'level']
            updated = False

            for field in update_fields:
                if field in data:
                    current_value = getattr(user, field)
                    new_value = data[field]

                    # Comparar valores actuales con nuevos
                    if current_value != new_value:
                        setattr(user, field, new_value)
                        updated = True

            if updated:
                db.session.commit()
                # Serializar manualmente para asegurar compatibilidad con JSON
                user_data = {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "last_name": user.last_name,
                    "username": user.username,
                    "stack": user.stack.value if user.stack else None,
                    "level": user.level.value if user.level else None
                }
                return jsonify({
                    "message": "Profile updated successfully",
                    "user": user_data
                }), 200
            else:
                return jsonify({"message": "No changes detected"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    # Retorno por defecto (nunca debería ejecutarse)
    return jsonify({"error": "Unexpected error"}), 500

# ------------------------Routes for Get all Posts------------------------


@api.route('/posts', methods=['GET'])
def get_all_posts():
    # This endpoint retrieves all posts with pagination, author info, and comment stats
    try:
        # Pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        posts_query = Post.query.order_by(Post.id.desc())
        posts_paginated = posts_query.paginate(
            page=page, per_page=per_page, error_out=False)

        if not posts_paginated.items:
            return jsonify({"msg": "No posts found"}), 404

        posts_data = []
        for post in posts_paginated.items:
            author = User.query.get(post.user_id)

            # get the comments for the post and count them
            comments = Comments.query.filter_by(post_id=post.id).all()
            comment_count = len(comments)

            # get the total likes for each comment and sum them up
            total_likes = 0
            for comment in comments:
                total_likes += Likes.query.filter_by(
                    comments_id=comment.id).count()

            post_data = post.serialize()
            post_data.update({
                "author_info": {
                    "username": author.username,
                    "avatar": author.image_URL if hasattr(author, 'image_URL') else None
                },
                "stats": {
                    "comments": comment_count,
                    "likes": total_likes  # Likes totales en todos los comentarios del post
                }
            })
            posts_data.append(post_data)

        return jsonify({
            "success": True,
            "posts": posts_data,
            "pagination": {
                "total_posts": posts_paginated.total,
                "current_page": page,
                "posts_per_page": per_page,
                "total_pages": posts_paginated.pages
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------------Routes GET Favorites by users------------------------
@api.route('/favorites', methods=['GET'])
@jwt_required()
def get_user_favorites():
    # obtein the favorites posts of the current user
    current_user_id = get_jwt_identity()
    favorites = Favorites.query.filter_by(user_id=current_user_id).all()
    return jsonify([fav.serialize() for fav in favorites]), 200

# ------------------------Routes for Add and Delete Favorites------------------------


@api.route('/favorites/<int:post_id>', methods=['POST', 'DELETE'])
@jwt_required()
def handle_single_favorite(post_id):
    # for add and delete favorite
    current_user_id = get_jwt_identity()

    # Verificar si el post existe
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    if request.method == 'POST':
        # Verificar si ya es favorito
        existing_fav = Favorites.query.filter_by(
            user_id=current_user_id,
            post_id=post_id
        ).first()

        if existing_fav:
            return jsonify({"error": "Post already in favorites"}), 400

        # Crear nuevo favorito
        new_favorite = Favorites(
            user_id=current_user_id,
            post_id=post_id
        )

        db.session.add(new_favorite)
        db.session.commit()

        return jsonify({
            "message": "Post added to favorites",
            "favorite": new_favorite.serialize()
        }), 201

    elif request.method == 'DELETE':
        # Buscar el favorito
        favorite = Favorites.query.filter_by(
            user_id=current_user_id,
            post_id=post_id
        ).first()

        if not favorite:
            return jsonify({"error": "Favorite not found"}), 404

        db.session.delete(favorite)
        db.session.commit()

        return jsonify({"message": "Favorite removed successfully"}), 200

# -----------------------Routes for Likes to Comments------------------------


@api.route('/comments/<int:comment_id>/like', methods=['POST', 'DELETE'])
@jwt_required()
def like_comment(comment_id):
    try:
        user_id = get_jwt_identity()
        comment = Comments.query.get(comment_id)

        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        # Check if the user has already liked this comment
        existing_like = Likes.query.filter_by(
            user_id=user_id,
            comments_id=comment_id
        ).first()

        # handle POST request to like a comment
        if request.method == 'POST':
            if existing_like:
                return jsonify({
                    "error": "You have already liked this comment",
                    "comment_id": comment_id
                }), 400

            new_like = Likes(
                user_id=user_id,
                comments_id=comment_id
            )
            db.session.add(new_like)
            action = "liked"

        # handle DELETE request to unlike a comment
        elif request.method == 'DELETE':
            if not existing_like:
                return jsonify({
                    "error": "You have not liked this comment",
                    "comment_id": comment_id
                }), 404

            db.session.delete(existing_like)
            action = "unliked"

        db.session.commit()

        # Return the updated like count for the comment
        like_count = Likes.query.filter_by(comments_id=comment_id).count()

        return jsonify({
            "success": True,
            "message": f"You have successfully {action} the comment",
            "comment_id": comment_id,
            "like_count": like_count,
            # This will indicate if the user has liked the comment
            "has_liked": request.method == 'POST'
        }), 200 if request.method == "DELETE" else 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------------Routes for Get all Users (Admin only)------------------------


@api.route('/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    try:
        # Pagination parameters
        # page and per_page are used to control the number of results returned
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Filter parameters
        # <--- strip() is for removing whitespaces from the beginning and end of the string
        search = request.args.get('search', '').strip()
        is_active = request.args.get('is_active', None, type=lambda v: v.lower(
        ) == 'true')  # --- filters for active or inactive users
        # --- filters for admin or non-admin users
        is_admin = request.args.get(
            'is_admin', None, type=lambda v: v.lower() == 'true')

        # Ordenation parameters
        sort_field = request.args.get(
            'sort', 'member_since')  # Default sort field
        # Default order is descending
        order = request.args.get('order', 'desc')

        # Field validation
        # Valid sort fields are defined to prevent SQL injection and ensure valid ordering
        valid_sort_fields = ['id', 'email', 'username',
                             'member_since', 'name', 'last_name', 'is_active', 'is_admin']

        # Check if the provided sort field is valid
        if sort_field not in valid_sort_fields:
            sort_field = 'member_since'  # Default sort field if the provided one is invalid

        # Build the query in our data base
        query = User.query

        # Apply search filter if exists
        # The search term is used to filter users by email, username, name or last_name
        if search:
            # The search term is wrapped in % to allow partial matches
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    # The ilike() function is used for case-insensitive matching
                    User.email.ilike(search_term),
                    User.username.ilike(search_term),
                    User.name.ilike(search_term),
                    User.last_name.ilike(search_term)
                )
            )

        # Apply filters for active and admin users if is specified
        # The is_active and is_admin parameters are used to filter users by their active status and admin status
        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        if is_admin is not None:
            query = query.filter(User.is_admin == is_admin)

        # Apply ordering asc or desc
        if order == 'asc':
            query = query.order_by(getattr(User, sort_field).asc())
        else:
            query = query.order_by(getattr(User, sort_field).desc())

        # Paginate the query results for page and per_page
        users_paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        # Response data
        users_data = []
        for user in users_paginated.items:
            user_data = {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "name": user.name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "member_since": user.member_since.isoformat(),
                "stack": user.stack.value if user.stack else None,
                "level": user.level.value if user.level else None
            }
            users_data.append(user_data)

        return jsonify({
            "success": True,
            "users": users_data,
            "pagination": {
                "total_users": users_paginated.total,
                "current_page": page,
                "users_per_page": per_page,
                "total_pages": users_paginated.pages
            },
            "filters": {
                "applied": {
                    "search": search,
                    "is_active": is_active,
                    "is_admin": is_admin,
                    "sort_field": sort_field,
                    "order": order
                },
                "valid_sort_fields": valid_sort_fields
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error to obtain the Users' List", "error": str(e)}), 500

# ------------------------Routes for Get User by ID (Admin only)------------------------


@api.route('/admin/users/<int:user_id>', methods=['GET', 'DELETE'])
@admin_required
def admin_manage_user(user_id):
    """
    Maneja operaciones para un usuario específico
    GET: Obtiene detalles del usuario
    DELETE: Elimina un usuario permanentemente (con todas sus dependencias)
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        current_admin_id = get_jwt_identity()

        # Evitar que un admin se elimine a sí mismo
        if request.method == 'DELETE' and user_id == current_admin_id:
            return jsonify({"error": "No puedes eliminarte a ti mismo"}), 400

        if request.method == 'GET':
            # Serialización segura para Enums
            user_data = {
                "id": user.id,
                "name": user.name,
                "last_name": user.last_name,
                "email": user.email,
                "username": user.username,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "member_since": user.member_since.isoformat() if user.member_since else None,
                "stack": user.stack.name if user.stack else None,  # Serialización correcta de Enum
                # Serialización correcta de Enum
                "level": user.level.name if user.level else None,
                "stats": {
                    "total_posts": len(user.say),
                    "total_comments": len(user.reply),
                    "total_favorites": len(user.star)
                }
            }
            return jsonify(user_data), 200

        elif request.method == 'DELETE':
            try:
                # Eliminar en cascada todas las dependencias

                # 1. Eliminar posts del usuario (con sus comentarios y favoritos)
                for post in user.say:
                    Comments.query.filter_by(post_id=post.id).delete()
                    Favorites.query.filter_by(post_id=post.id).delete()
                    db.session.delete(post)

                # 2. Eliminar comentarios hechos por el usuario
                Comments.query.filter_by(user_id=user_id).delete()

                # 3. Eliminar favoritos del usuario
                Favorites.query.filter_by(user_id=user_id).delete()

                # 4. Eliminar likes del usuario
                Likes.query.filter_by(user_id=user_id).delete()

                # Finalmente eliminar el usuario
                db.session.delete(user)
                db.session.commit()

                return jsonify({
                    "message": "Usuario eliminado permanentemente con todas sus dependencias",
                    "deleted_user_id": user_id
                }), 200

            except Exception as delete_error:
                db.session.rollback()
                return jsonify({
                    "error": "Error al eliminar el usuario",
                    "details": str(delete_error)
                }), 500

    except Exception as e:
        return jsonify({
            "error": "Error en el servidor",
            "details": str(e)
        }), 500
# ----------------------Routes for Get all Post (Admin only)------------------------


@api.route('/admin/posts', methods=['GET'])
@admin_required
def admin_get_posts():
    """
    Obtiene todos los posts (sin parámetro admin inyectado)
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        posts = Post.query.order_by(Post.id.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        posts_data = [post.serialize() for post in posts.items]

        return jsonify({
            "posts": posts_data,
            "total": posts.total,
            "pages": posts.pages,
            "current_page": page
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------Routes for Get Post by ID (Admin only)------------------------


@api.route('/admin/posts/<int:post_id>', methods=['GET', 'DELETE'])
@admin_required
def handle_single_admin_post(post_id):
    """
    Maneja operaciones para un post específico
    GET: Obtiene detalles del post
    DELETE: Elimina un post específico
    """
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post no encontrado"}), 404

    if request.method == 'GET':
        post_data = post.serialize()
        post_data['author'] = {
            'id': post.author.id,
            'username': post.author.username,
            'email': post.author.email
        }
        post_data['comments'] = [c.serialize() for c in post.reply]
        return jsonify(post_data), 200

    elif request.method == 'DELETE':
        try:
            # Eliminar en cascada
            Comments.query.filter_by(post_id=post_id).delete()
            Favorites.query.filter_by(post_id=post_id).delete()
            db.session.delete(post)
            db.session.commit()
            return jsonify({
                "message": "Post eliminado permanentemente",
                "deleted_id": post_id
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

# ------------------------Routes for Get Comments (Admin only)------------------------


@api.route('/admin/comments', methods=['GET'])
@admin_required
def admin_get_comments():
    """
    Obtiene todos los comentarios (sin parámetro admin inyectado)
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        comments = Comments.query.order_by(Comments.id.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        comments_data = [comment.serialize() for comment in comments.items]

        return jsonify({
            "comments": comments_data,
            "total": comments.total,
            "pages": comments.pages,
            "current_page": page
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------Routes for Get Comments by ID (Admin only)------------------------


@api.route('/admin/comments/<int:comment_id>', methods=['GET', 'DELETE'])
@admin_required
def handle_single_admin_comment(comment_id):
    """
    Maneja operaciones para un comentario específico
    GET: Obtiene detalles del comentario
    DELETE: Elimina un comentario específico
    """
    comment = Comments.query.get(comment_id)
    if not comment:
        return jsonify({"error": "Comentario no encontrado"}), 404

    if request.method == 'GET':
        comment_data = comment.serialize()
        comment_data['author'] = {
            'id': comment.author.id,
            'username': comment.author.username
        }
        comment_data['post_title'] = comment.say.title
        return jsonify(comment_data), 200

    elif request.method == 'DELETE':
        try:
            # Eliminar en cascada
            Likes.query.filter_by(comments_id=comment_id).delete()
            db.session.delete(comment)
            db.session.commit()
            return jsonify({
                "message": "Comentario eliminado permanentemente",
                "deleted_id": comment_id
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
# ---------------------------Routes for Get Dashboard (Admin only)--------------------------


@api.route('/admin/dashboard', methods=['GET'])
@admin_required
def admin_dashboard():
    """
    Dashboard administrativo (sin parámetro admin inyectado)
    """
    try:
        current_admin_id = get_jwt_identity()  # Obtenemos el ID desde el token

        stats = {
            "total_users": User.query.count(),
            "active_users": User.query.filter_by(is_active=True).count(),
            "total_posts": Post.query.count(),
            "recent_posts": [p.serialize() for p in Post.query.order_by(Post.id.desc()).limit(5).all()],
            "total_comments": Comments.query.count(),
            "your_admin_id": current_admin_id  # Solo información de referencia
        }

        return jsonify(stats), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# -----------------------------Routes for payment method-------------------------


@api.route('/process-payment', methods=['POST'])
def process_payment():
    """
    Ruta básica para procesar pagos con Stripe
    Requiere:
    - token: Token de tarjeta generado por Stripe.js
    - amount: Monto en centavos (ej: 1000 = $10.00)
    - currency: Moneda (opcional, por defecto 'usd')
    - description: Descripción del pago (opcional)
    """
    try:
        data = request.get_json()

        # Validación básica
        if not data or 'token' not in data or 'amount' not in data:
            return jsonify({"error": "Token and amount are required"}), 400

        # Crear el cargo en Stripe
        charge = stripe.Charge.create(
            amount=data['amount'],
            currency=data.get('currency', 'usd'),
            source=data['token'],  # Obtenido con Stripe.js en el frontend
            description=data.get('description', 'Payment for service')
        )

        # Respuesta exitosa (sin guardar en DB)
        return jsonify({
            "status": "success",
            "message": "Payment processed",
            "payment_id": charge.id,
            "amount": charge.amount,
            "currency": charge.currency
        }), 200

    except stripe.error.CardError as e:
        # Error de tarjeta (declinada, etc.)
        return jsonify({
            "status": "error",
            "type": "card_error",
            "message": e.user_message
        }), 400

    except stripe.error.StripeError as e:
        # Otros errores de Stripe
        return jsonify({
            "status": "error",
            "type": "stripe_error",
            "message": str(e)
        }), 500

    except Exception as e:
        # Errores inesperados
        return jsonify({
            "status": "error",
            "type": "server_error",
            "message": "An unexpected error occurred"
        }), 500
# -----------------------------Defs for OpenAI API-------------------------


logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv("GPTKey"))


def parse_ai_response(response_text: str):
    pattern = re.compile(
        r"RANK_POSITION:\s*(\d+)\s*"
        r"POST_ID:\s*(\d+)\s*"
        r'JUSTIFICATION:\s*"([^"]+)"\s*'
        r'RELEVANCE:\s*"([^"]+)"\s*'
        r'FIT_SCORE:\s*(\d+)'
    )

    results = []
    for match in pattern.findall(response_text):
        rank, post_id, justification, relevance, score = match
        results.append({
            "rank_position": int(rank),
            "post_id": int(post_id),
            "justification": justification.strip(),
            "relevance": relevance.strip(),
            "fit_score": int(score)
        })

    results.sort(key=lambda x: x["rank_position"])
    return results


def validate_response_format(response_text):
    return "RANK_POSITION" in response_text and "FIT_SCORE" in response_text


def AI_search(user_request, post_results_list, user_tags=None):
    prompt = f"""
You are an assistant tasked with ranking a list of open-source project posts based on how well they match a user’s search request and optional profile tags. You will receive:

- A short user request
- Optional profile tags
- A list of candidate posts (each with an ID, title, and description)

---

## Your task is to:

1. Evaluate each post for how well it matches the user’s request and tags.
2. Assign each post:
    - A ranking position (starting at 1)
    - Its post ID
    - A justification for why it belongs in that position
    - A relevance label from the list below
    - A FIT_SCORE from 0 to 100 that reflects how well it fits (use the full range, do not inflate)

## Relevance labels:

- Exceptional match – fits the request closely, ideal candidate
- Strong match – meets core needs, clear and useful
- Moderate match – helpful, but missing key elements
- Mild match – loosely related, likely not sufficient
- Low match – barely relevant, should only be shown as fallback

## Format (repeat for each post):

RANK_POSITION: {{number}}  
POST_ID: {{id}}  
JUSTIFICATION: "{{reason the post is in this position}}"  
RELEVANCE: "{{one of the labels}}"  
FIT_SCORE: {{score}}

The JUSTIFICATION must refer to specific aspects of the user’s request, profile tags (if available), and the project post. Write in second person, directly addressing the user’s need — e.g., “You need a repo for a desktop app for tracking vacation days that’s beginner-friendly, uses mainly HTML, JS, CSS, and Python...”. Do not use vague phrases like “closely matches” or “relevant.” Be specific and concise. Explain exactly what part of the user’s need is met, and how.

---

### User Request:
"{user_request}"

### Profile Tags:
{user_tags or 'No tags provided'}

### Candidate Posts:
{post_results_list}

---

### Response Instructions:
Only use the format provided. No extra commentary.
"""

    try:
        logger.info(f"Sending request to OpenAI for input: {user_request}")

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You’re a data analyst, senior programmer, and coding teacher. Your job is to retrieve and rank the most relevant GitHub project posts from our database based on the user’s needs and tags."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=650,
            temperature=0.3
        )

        result_text = response.choices[0].message.content

        usage = response.usage
        input_tokens = usage.prompt_tokens
        output_tokens = usage.completion_tokens
        total_tokens = usage.total_tokens

        input_rate = 0.0015 / 1000
        output_rate = 0.002 / 1000
        estimated_cost = (input_tokens * input_rate) + \
            (output_tokens * output_rate)

        if validate_response_format(result_text):
            results = parse_ai_response(result_text)
            debug_note = "✅ Parsed successfully."
        else:
            results = []
            debug_note = "⚠️ Format validation failed — skipping parsing."

        return {
            "results": results,
            "dev_debug": {
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": total_tokens,
                "estimated_cost": f"${estimated_cost:.5f}",
                "budget_pct_used": f"{(estimated_cost / 5) * 100:.2f}%",
                "raw_output": result_text,
                "status": debug_note
            }
        }

    except Exception as e:
        logger.error(f"API call failed: {e}")
        return {
            "results": [],
            "dev_debug": {
                "error": str(e),
                "status": "❌ API error"
            }
        }

# -----------------------------Se añadio Delete Comments 27/7 -------------------------

@api.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user or not user.is_admin:
        return jsonify({"error": "Unauthorized. Admin access required"}), 403

    comment = Comments.query.get(comment_id)
    if not comment:
        return jsonify({"error": "Comment not found"}), 404

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"message": "Comment deleted successfully"}), 200


