const express = require('express'); //引入express模块
const app = express();              //创建实例
const mysql =require('mysql');       //引入mysql  模块
app.use(express.json())  //解析json格式
// 创建数据库连接


// 允许跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
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

//定义路由
// app.get('/a',(req,res)=>{
//     let sqlStr = 'INSERT INTO sys_user ( user_id,username,password,nickname,phone) VALUES( "1","admin","123456","超级管理员","13888888888")';
//     //执行mysql  语句
//     conn.query(sqlStr,(err)=>{
//         console.log(err,'如果为null 就是插入成功')
//     })
//     //成功后的页面提示
//     res.send('插入成功')
// })

// 查询信息
// app.get('/find',(req,res)=>{
//     let sql = 'SELECT * from sys_user';
//     conn.query(sql,(err,results)=>{
//     //返回查询的信息为results 然后将其显示在页面上
//         res.send(results)
//     })
   
// })
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
        
        // if(user.password !== password || user.username !== username){
        //     return res.send({
        //         code:0,
        //         msg:'账号或密码错误'
        //     })
        // }


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