from flask import current_app

def Settings():
    response_string = ''
    for key,value in current_app.config.items():
        response_string += key + ' : ' + str(value) + '<br>\n'
    return response_string
