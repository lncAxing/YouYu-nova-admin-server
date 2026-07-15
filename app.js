const express = require('express'); //引入express模块
const app = express();              //创建实例
const mysql =require('mysql');       //引入mysql  模块
const cookieParser = require('cookie-parser');  //解析cookie
const session = require('express-session');

const SESSION_SECRET = 'noveAdminServer2026';
const REMEMBER_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

//中间件
app.use(express.json())  //解析json格式
app.use(cookieParser()) //解析请求携带的cookie

//新增sesion配置
app.use(session({
  secret:SESSION_SECRET, //加密密钥自定义
  resave:false, //当用户无操作，或没有修改登录信息，不会重复保存会话，节省性能
  saveUninitialized:false, //游客没登陆、空会话。不往内存存数据，
  cookie:{
    httpOnly:true,         //不允许浏览器js读取cookie防止xss攻击
    // maxAge:3*24*60*60*1000, //3天有效期
    path:'/',
    sameSite:'lax'         //防止跨站伪造登录
  }
}))
// 创建数据库连接
const conn =mysql.createConnection({
    user:'nova_admin',                        //数据库用户名
    password:'enBxPZi3m74GimP3',        //数据库密码
    host:'localhost',                    //数据库地址
    database:'nova_admin',               //数据库名称
})

// 允许跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Credentials', 'true'); 
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next()
})
//测试连接
conn.connect((err)=>{
    console.log(err,'如果为null 就是连接成功');
})

//开启服务器
app.listen(3000,()=>{
    console.log('服务器已启动，端口3000监听中')

})


//登录接口
app.post("/login",(req,res)=>{
    var username = req.body.username
    var password = req.body.password
    if(!username || !password){
        return res.send({
            code:0,
            msg:"用户名与密码为必传参数.."
        })
    }
    // 数据库查询用户
    //账号与密码需一致，防止重名，少一个返回的length就是0
    let sql = "SELECT * FROM sys_user WHERE username = ? AND password = ?"; 
    conn.query(sql,[username,password],(err,results)=>{
        if(err){
            return res.send({
                code:-1,
                msg:"服务器数据异常"
            })
        }
        if(results.length == 0){
            return res.send ({
                code:0,
                msg:'账号或密码错误'
            })
        }
        // 数据库查询返回的数组
        let user = results[0]
        
        // 把完整用户信息存入服务端session(内存保存)
        //浏览器只会收到加密sid，不会暴露用户ID
        req.session.user = {
          user_id:user.user_id,
          username:user.username,
          nickname:user.nickname,
          phone:user.phone
        }
        req.session.cookie.maxAge = req.body.isRemember
          ? REMEMBER_MAX_AGE
          : null
  
        // 校验通过
        res.send({
            code:1,
            msg:'登录成功',
            data:req.session.user
        })
    })

})

//测试接口:读取cookie，判断是否登录
app.get('/getUserInfo',(req,res)=>{
    if(!req.session.user){
        return res.send({code:0,msg:'未登录，请登录'})
    }
    res.send({code:1,msg:'已登录',data:req.session.user})
})
//退出登录：清除cookie
app.post('/logout',(req,res) =>{
    req.session.destroy(err=>{
      if(err) return res.send({ code:-1,msg:'退出失败'})
      res.send({code:1,msg:'退出登录成功'})
    })
})
