const express = require('express'); //引入express模块
const app = express();              //创建实例
const mysql =require('mysql');       //引入mysql  模块
const cookieParser = require('cookie-parser')  //解析cookie

//中间件
app.use(express.json())  //解析json格式
app.use(cookieParser()) //解析请求携带的cookie


// 创建数据库连接

// 允许跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Credntials','true'); //允许携带cookie
  if(req.method === 'OPTTIONS') return res.sendStatus(200);
  next()
})
app.use(express.json())

const conn =mysql.createConnection({
    user:'nova_admin',                        //数据库用户名
    password:'enBxPZi3m74GimP3',        //数据库密码
    host:'localhost',                    //数据库地址
    database:'nova_admin',               //数据库名称
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
        
        // 登录成功,生成Cookie返回给服务器
        res.cookie('userId',user.user_id,{
            httpOnly:true, // 前端js无法读取，防xss
            maxAge:3*24*60*60*1000, //有效期3天 (毫秒)
            path:'/',     //全部接口都携带cookie
            sameSite:'lax'  //阻止跨站请求伪造
        })

        // 校验通过
        res.send({
            code:1,
            msg:'登录成功',
            data:{
                user_id: user.user_id,
                username: user.username,
                nickname: user.nickname,
                phone: user.phone
            }
        })
    })

})

//测试接口:读取cookie，判断是否登录
app.get('/getUserInfo',(req,res)=>{
    //获取浏览器携带的cookie
    const userId = req.cookies.userId
    if(!userId){
        return res.send({code:0,msg:'未登录，请登录'})
    }
    res.send({code:1,msg:'已登录',userId})
})
//退出登录：清除cookie
app.post('/logout',(req,res) =>{
    res.clearCookie('userId')
    res.send({code:1,msg:'退出登录成功'})
})
