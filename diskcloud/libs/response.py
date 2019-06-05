from flask import jsonify

def gen_error_res(err_mes,status_code=500):
    response = jsonify({'err_mes': err_mes})
    response.status_code = status_code
    return response

# def gen_success_json(succ_mes=None):
#     if succ_mes is None:
#         return ('',200)
#     response = jsonify({'succ_mess': succ_mes})
#     return response

def gen_json_res(json_obj,status_code=200):
    response = jsonify(json_obj)
    response.status_code = status_code
    return response
