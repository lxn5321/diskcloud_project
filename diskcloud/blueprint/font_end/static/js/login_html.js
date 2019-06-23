"use strict"

function init_all(){
  let toggleText = document.querySelectorAll('.toggle-text')
  toggleText[0].onclick = toggleSwitch;
  toggleText[1].onclick = toggleSwitch;
  document.querySelector('body').onclick = wholeClickHanlder;
  document.querySelector('#login-btn').onclick = loginClickHanlder;
  document.querySelector('#register-btn').onclick = registerClickHandler;
}

function toggleSwitch(ev){
  if (ev.currentTarget.classList.contains('selected') === false){
    document.querySelector('.selected').classList.remove('selected');
    ev.currentTarget.classList.add('selected');
    if (ev.currentTarget.id === 'toggle-login'){
      document.querySelector('.toggle-line').style['margin-left'] = '2px';
      document.querySelector('.toggle-line').classList.remove('toggle-switch');
      document.querySelector('.toggle-line').classList.add('toggle-switch-reverse');
      document.querySelector('.login-container').style.display = 'flex';
      document.querySelector('.register-container').style.display = 'none';
      document.querySelector('#reg_input_username').value = '';
      document.querySelector('#reg_input_password').value = '';
      document.querySelector('#reg_input_password_confirm').value = '';
      document.querySelector('#reg_input_email').value = '';
      document.querySelector('#login_input_username').focus();
    } else{
      document.querySelector('.toggle-line').style['margin-left'] = '57px';
      document.querySelector('.toggle-line').classList.remove('toggle-switch-reverse');
      document.querySelector('.toggle-line').classList.add('toggle-switch');
      document.querySelector('.login-container').style.display = 'none';
      document.querySelector('.register-container').style.display = 'flex';
      document.querySelector('#login_input_username').value = '';
      document.querySelector('#login_input_password').value = '';
      document.querySelector('#reg_input_username').focus();
    }
  }
}

function wholeClickHanlder(ev){
  $('#login_input_username').popover('dispose');
  $('#login_input_password').popover('dispose');
  $('#reg_input_username').popover('dispose');
  $('#reg_input_password').popover('dispose');
  $('#reg_input_password_confirm').popover('dispose');
  $('#reg_input_email').popover('dispose');
  $('.alert').alert('close');
}

function loginClickHanlder(ev){
  ev.preventDefault();
  ev.stopPropagation();
  let username_input = $('#login_input_username');
  let password_input = $('#login_input_password');
  let checkbox_value = document.querySelector('#checkbox_cookie').checked?'true':'false';

  if(username_input.val() === ''){
    username_input.attr('data-content', '请输入用户名');
    username_input.popover('show');
  }else if(validUsername(username_input.val()) === false){
    username_input.attr('data-content', '用户名不合法');
    username_input.popover('show');
  }else if(password_input.val() === ''){
    password_input.attr('data-content', '请输入密码');
    password_input.popover('show');
  }else if(validPassword(password_input.val()) === false){
    password_input.attr('data-content', '密码不合法');
    password_input.popover('show');
  }else{
    fetch(PARADICT["user_api_url"] + '?login=1', {
      credentials: "same-origin",
      method: "POST",
      body: JSON.stringify({
        username: username_input.val(),
        password: password_input.val(),
        enable_cookie: checkbox_value
      }),
      headers: {
        'content-type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok){
        window.location.replace(PARADICT["main_html_url"] + username_input.val() + '/');
      }else{
        response.json().then(data => {
          username_input.val('');
          password_input.val('');
          $('.alert-container').html('<div class="alert alert-danger fade show" role="alert">登录失败<br>' + data.err_mes + '</div>')
          $('.alert').alert();
        })
      }
    })
  }
}
function registerClickHandler(ev){
  ev.preventDefault();
  ev.stopPropagation();
  let username_input = $('#reg_input_username');
  let password_input = $('#reg_input_password');
  let password_confirm_input = $('#reg_input_password_confirm');
  let email_input = $('#reg_input_email');

  if(username_input.val() === ''){
    username_input.attr('data-content', '请输入用户名');
    username_input.popover('show');
  }else if(validUsername(username_input.val()) === false){
    username_input.attr('data-content', '用户名不合法');
    username_input.popover('show');
  }else if(password_input.val() === ''){
    password_input.attr('data-content', '请输入密码');
    password_input.popover('show');
  }else if(validPassword(password_input.val()) === false){
    password_input.attr('data-content', '密码不合法');
    password_input.popover('show');
  }else if(password_confirm_input.val() === ''){
    password_confirm_input.attr('data-content', '请输入确认密码');
    password_confirm_input.popover('show');
  }else if(password_input.val() !== password_confirm_input.val()){
    password_confirm_input.attr('data-content', '密码不相同');
    password_confirm_input.popover('show');
  }else if(email_input.val() === ''){
    email_input.attr('data-content', '请输入email');
    email_input.popover('show');
  }else if(validEmail(email_input.val()) === false){
    email_input.attr('data-content', 'email不合法');
    email_input.popover('show');
  }else{
    fetch(PARADICT["user_api_url"] + '?register=1', {
      credentials: "same-origin",
      method: "POST",
      body: JSON.stringify({
        username: username_input.val(),
        password: password_input.val(),
        email: email_input.val()
      }),
      headers: {
        'content-type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok){
        $('.alert-container').html('<div class="alert alert-success fade show" role="alert">注册成功<br>即将转入用户界面</div>');
        $('.alert').alert();
        setTimeout(() => {
                  window.location.replace(PARADICT["main_html_url"] + username_input.val() + '/');
                }, 1000 )
      }else{
        response.json().then(data => {
          username_input.val('');
          password_input.val('');
          password_confirm_input.val('');
          email_input.val('');
          $('.alert-container').html('<div class="alert alert-danger fade show" role="alert">注册失败<br>' + data.err_mes + '</div>')
          $('.alert').alert();
        })
      }
    })
  }
}

function validUsername(username){
  let re = /^[a-zA-Z]{1}[a-zA-Z0-9_\-]{7,31}$/;
  return re.test(username);
}

function validPassword(password){
  let re = /^[a-zA-Z0-9_!@#$%,\+\-\^\.]{8,32}$/;
  return re.test(password);
}

function validEmail(email){
  let re = /^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/;
  return re.test(email);
}

init_all()
