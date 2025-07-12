from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Post, Comments
from api.utils import generate_sitemap, APIException
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)
bcrypt = Bcrypt()

#------------------------ Hello Test ------------------------
@api.route('/hello', methods=['GET'])
def handle_hello():
    return jsonify({"message": "Hello! I'm a message that came from the backend."}), 200

#------------------------ Register ------------------------
@api.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    last_name = data.get('last_name')
    username = data.get('username')
    stack = data.get('stack')
    level = data.get('level')

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
        stack=stack,
        level=level
    )
    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=new_user.id)

    return jsonify({
        "message": "User registered successfully",
        "token": access_token,
        "user": new_user.serialize()
    }), 201

#------------------------ Login ------------------------
@api.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user.id)

    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": user.serialize()
    }), 200

#------------------------ Contact ------------------------
@api.route('/contact', methods=['POST'])
def handle_contact():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    if not all([name, email, message]):
        return jsonify({"error": "All fields are required"}), 400

    return jsonify({
        "message": "Thank you for contacting us! We will get back to you soon."
    }), 200

#------------------------ New Post ------------------------
@api.route('/post', methods=['POST'])
@jwt_required()
def handle_new_post():
    user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')
    image_URL = data.get('image_URL')
    description = data.get('description')
    repo_URL = data.get('repo_URL')

    if not description or not title or not repo_URL:
        return jsonify({"msg": "Description, title and repo_URL are required"}), 400

    post = Post(
        user_id=user_id,
        title=title,
        image_URL=image_URL,
        description=description,
        repo_URL=repo_URL
    )
    db.session.add(post)
    db.session.commit()

    return jsonify({
        "msg": "Post created successfully",
        "post": post.serialize()
    }), 201

#------------------------ Search IA ------------------------
@api.route('/search-ia', methods=['POST'])
@jwt_required()
def handle_search_ia():
    return jsonify({
        "message": "Hello! I'm a message from the backend via POST."
    }), 200

#------------------------ Comments ------------------------
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

    return jsonify({
        "msg": "Comment added successfully",
        "comment": comments.serialize()
    }), 201