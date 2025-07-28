from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Date, Integer, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
import enum
import datetime
from datetime import date, datetime, UTC
db = SQLAlchemy()


class Stack(enum.Enum):
    HTML = "HTML"
    CSS = "CSS"
    JAVASCRIPT = "JavasScript"
    PYTHON = "Python"
    SQL = "SQL"


class Level(enum.Enum):
    STUDENT = "student"
    JUNIOR_DEV = "junior_dev"
    MID_DEV = "mid_dev"
    SENIOR_DEV = "senior_dev"


class User(db.Model):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    # gh_login: Mapped[str] = mapped_column(
    #     String(120), unique=True, nullable=False) #en tabla aparte con User como FK, se usará una librería para eso
    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)  # no incluir en formulario
    is_admin: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=False)  # no incluir en formulario
    member_since: Mapped[date] = mapped_column(
        # no incluir en formulario, se llena automáticamente
        Date(), nullable=False, default=datetime.now(UTC))
    stack: Mapped[enum.Enum] = mapped_column(Enum(Stack), nullable=True) 
    level: Mapped[enum.Enum] = mapped_column(Enum(Level), nullable=True)

# relaciones User one to many
    star: Mapped[List["Favorites"]] = relationship(back_populates="author")
    say: Mapped[List["Post"]] = relationship(back_populates="author")
    reply: Mapped[List["Comments"]] = relationship(back_populates="author")
    love: Mapped[List["Likes"]] = relationship(back_populates="author")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "last_name": self.last_name,
            "email": self.email,
            # "gh_login": self.gh_login,
            "username": self.username,
            "is_active": self.is_active,
            "is_admin": self.is_admin,
            "stack": self.stack if self.stack else None,
            "level": self.level if self.level else None,
            "member_since": self.member_since,
            # do not serialize the password, its a security breach
        }
        
        


class Post(db.Model):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    title: Mapped[str] = mapped_column(String(40), nullable=True)
    image_URL: Mapped[str] = mapped_column(String(2083), nullable=True)
    description: Mapped[str] = mapped_column(String(200), nullable=False)
    repo_URL: Mapped[str] = mapped_column(String(2083), nullable=False)

    # relación one to many
    star: Mapped[List["Favorites"]] = relationship(back_populates="say")
    reply: Mapped[List["Comments"]] = relationship(back_populates="say")

    # relación many to one
    author: Mapped["User"] = relationship(back_populates="say")

    def serialize(self):
        return {
            "id": self. id,
            "user_id": self.user_id,
            "title": self.title,
            "image_URL": self.image_URL,
            "description": self.description,
            "repo_URL": self.repo_URL
        }


class Favorites(db.Model):
    __tablename__ = "favorites"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"))

    # Many to one
    author: Mapped["User"] = relationship(back_populates="star")
    say: Mapped["Post"] = relationship(back_populates="star")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "post_id": self.post_id,
        }


class Comments(db.Model):
    __tablename__ = "comments"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"))
    title: Mapped[str] = mapped_column(String(40), nullable=True)
    text: Mapped[str] = mapped_column(String(120), nullable=False)
    date_added: Mapped[date] = mapped_column(
        # cambiar a que muestre hora (datetime en los corchetes no funcionó)
        nullable=False, default=datetime.now(UTC))

    # Many to one
    author: Mapped["User"] = relationship(back_populates="reply")
    say: Mapped["Post"] = relationship(back_populates="reply")
    love: Mapped[List["Likes"]] = relationship(back_populates="reply")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "post_id": self.post_id,
            "title": self.title,
            "text": self.text,
            "date_added": self.date_added,
            "author": { # se añadio esta parte para los comments 27/7
                "id": self.author.id,
                "name": self.author.name,
                "username": self.author.username
            }
        }


class Likes(db.Model):
    __tablename__ = "likes"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    comments_id: Mapped[int] = mapped_column(ForeignKey("comments.id"))

    author: Mapped["User"] = relationship(back_populates="love")
    reply: Mapped["Comments"] = relationship(back_populates="love")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "post_id": self.post_id,
        }
    
