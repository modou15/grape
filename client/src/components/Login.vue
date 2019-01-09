<template>
    <div class="container">
        <div class="login-wrapper">
            <h1>登录</h1>
            <Form ref="formCustom" :model="formCustom" :rules="ruleCustom">
                <FormItem prop="username">
                    <Input placeholder="Username" type="text" v-model="formCustom.username"></Input>
                </FormItem>
                <FormItem prop="passwd">
                    <Input placeholder="password" type="password" v-model="formCustom.passwd" @keyup.enter.native="handleSubmit('formCustom')"></Input>
                </FormItem>
                <br/>
                <FormItem>
                    <Button type="primary" @click="handleSubmit('formCustom')">登录</Button>
                </FormItem>
            </Form>
        </div>
    </div>
</template>
<script>
    import { handleRequest, msgHandler } from 'libs';
    import cookies from 'js-cookie'
    export default {
        data () {
            const validateUsername = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入帐号'));
                } else {
                    callback();
                }
            };
            const validatePass = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入密码'));
                } else {
                    callback();
                }
            };
            return {
                loading: false,
                formCustom: {
                    username: '',
                    passwd: ''
                },
                ruleCustom: {
                    username: [
                        { validator: validateUsername, trigger: 'blur' }
                    ],
                    passwd: [
                        { validator: validatePass, trigger: 'blur' }
                    ]
                }
            }
        },
        methods: {
            handleSubmit (name) {
                // 避免多次点击
                if(this.loading) {
                    return;
                }
                this.$refs[name].validate((valid) => {
                    if (valid) {
                      debugger;
                      if(this.formCustom.username == 'admin' && this.formCustom.passwd == 'admin') {
                        cookies.set('isLogin', true);
                        let redirect = decodeURIComponent(this.$route.query.redirect);
                        console.log(redirect);
                        this.$router.push({
                            path: redirect
                        });
                      }else {
                        msgHandler('error', '帐号或者密码有误，请重新输入', this);
                        cookies.remove('isLogin');
                      }
                    } else {
                        this.$Message.destroy();
                        this.$Message.error('帐号或者密码有误，请重新输入');
                    }
                })
            }
        }
    }
</script>

<style scoped>
    .container,
    .container:before{
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        overflow: hidden;

    }
    .container:before{
        content: '';
        width: 102%;
        height: 102%;
        left: -1%;
        top: -1%;
        z-index: -1;
        background: url('//img.zaozuo.com/51d91a6f8e91bef881f63aed629a975d');
        -webkit-filter: blur(5px);
        -moz-filter: blur(5px);
        -ms-filter: blur(5px);
        filter: blur(5px);
    }
    .login-wrapper{
        width: 500px;
        height: auto;
        padding: 50px;
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 3;
        -webkit-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
    .login-wrapper h1{
        text-align: center;
        padding-bottom: 50px;
        color: #fff;
        font-size: 30px;
        font-weight: normal;
        letter-spacing: 10px;
    }
</style>
<style>
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
        -webkit-transition-delay: 9999s;
        -webkit-transition: color 9999s ease-out, background-color 9999s ease-out;
    }
    .login-wrapper ::-webkit-input-placeholder{
        color: #000;
        opacity: 0.5;
    }
    .login-wrapper :-moz-placeholder{
        color: #000;
        opacity: 0.5;
    }
    .login-wrapper ::-moz-placeholder{
        color: #000;
        opacity: 0.5;
    }
    .login-wrapper :-ms-input-placeholder{
        color: #000;
        opacity: 0.5;
    }
    .login-wrapper .ivu-input{
        height: 60px;
        line-height: 60px;
        border: none;
        font-size: 18px;
        text-align: center;
        background: rgba(255,255,255,.9)!important;
    }
    .login-wrapper .ivu-form-item-error-tip{
        width: 200px;
        top: 35%;
        left: 102%;
        color: #ff0000;
    }
    .login-wrapper .ivu-btn-primary{
        width: 100%;
        height: 60px;
        font-size: 18px;
    }
</style>
