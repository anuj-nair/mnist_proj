# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask, render_template, request, jsonify
from lib.classify import get_prediction
import pickle
# Flask constructor takes the name of
# current module (__name__) as argument.
app = Flask(__name__)


@app.route('/')
def home_page():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    #    return render_template('index.html')
    data=request.get_json()
    data=get_prediction(data)
    return jsonify(data) 


# main driver function
if __name__ == '__main__':

    # run() method of Flask class runs the application
    # on the local development server.
    app.run()
