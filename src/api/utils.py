from flask import jsonify, url_for
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
# from front.assets import "logocompleto.png"


class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)


def generate_sitemap(app):
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        # Filter out rules we can't navigate to in a browser
        # and rules that require parameters
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)

    links_html = "".join(["<li><a href='" + y + "'>" +
                         y + "</a></li>" for y in links])
    return """
        <div style="text-align: center;">
        <img style="max-height: 80px" src='https://storage.googleapis.com/breathecode/boilerplates/rigo-baby.jpeg' />
        <h1>Rigo welcomes you to your API!!</h1>
        <p>API HOST: <script>document.write('<input style="padding: 5px; width: 300px" type="text" value="'+window.location.href+'" />');</script></p>
        <p>Start working on your project by following the <a href="https://start.4geeksacademy.com/starters/full-stack" target="_blank">Quick Start</a></p>
        <p>Remember to specify a real endpoint path like: </p>
        <ul style="text-align: left;">"""+links_html+"</ul></div>"


def send_email(sender, subject, user_message):
    SMTP_ADDRESS = os.getenv('SMTP_ADDRESS')
    SMTP_PORT = int(os.getenv('SMTP_PORT'))
    EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS')
    GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD')

    message = MIMEMultipart('alternative')
    message['Subject'] = subject
    message['From'] = sender
    message['To'] = EMAIL_ADDRESS

    html = f'''
    <html>
        <body class="test">
            <h3><strong>Message from {sender} to the GitWise team about {subject}:</strong></h3>
            <p>Message: {user_message}</p>
        </body>
    </html>

    '''

    message.attach(MIMEText(html, 'html'))
    user_message = message.as_string()

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_ADDRESS, SMTP_PORT, context=context) as server:
            server.login(EMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.sendmail(sender, EMAIL_ADDRESS, user_message)
            print('Message sent!')
        return True
    except Exception as error:
        print("Couldn't send email:", error)
        print("Error arguments:", error.args)
        return False
