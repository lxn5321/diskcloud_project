from flask import current_app,jsonify

def gen_error_res(status_code,err_mes):
    response = jsonify({'error_message': err_mes})
    response.status_code = status_code
    response.headers['Cache-Control'] = 'public, max-age=' + str(current_app.config['SEND_FILE_MAX_AGE_DEFAULT'])
    return response
