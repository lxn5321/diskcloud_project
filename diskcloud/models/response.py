from flask import current_app,jsonify

def gen_error_res(status_code,err_mes):
    response = jsonify({'err_mes': err_mes})
    response.status_code = status_code
    return response
