const express = require("express");
const cors = require("cors");
const server = express();
const qs = require('qs')
// 引入连接池
const pool = require('./pool');
const { query } = require("express");
const bodyParser = require('body-parser')
// 使用badyParser中间件
server.use(bodyParser.urlencoded({
  extended:false
}
))
server.use( cors({
  origin:['http://127.0.0.1:8080',"http://localhost:8080" ,
  'http://127.0.0.1:8081',"http://localhost:8081" ]
}) )
server.listen(3000, () => {
  console.log("3000端口已起用");
});

server.get('/category',(req,res)=>{
  // res.send("成功显示")
  let sql  = 'SELECT id,category_name FROM xzqa_category';
  pool.query(sql,(err,result)=>{
    if(err) throw err;
    res.send({message:'查询成功',code:1,result})
  })
})

// /lists路由接口
server.get('/lists',(req,res)=>{
  // 结束客户端传递的URL参数
  // console.log(req.query)
  let cid = req.query.cid;    //文章分类ID
  let page = req.query.page;  // 页码
  let pagesize = 15;    //存储每页现实的记录数
  let offset = (page-1) * pagesize;
  let sql = 'SELECT id,subject,description,image FROM xzqa_article WHERE category_id=? LIMIT '+ offset +"," +pagesize;
  pool.query(sql,[cid],(err,results)=>{
    if (err) throw err;
    res.send({message:"查询成功",code:"1",results}) 
  })
})

//获取特定文章信息的API接口
server.get('/article',(req,res)=>{
  //获取文章ID
  let id = req.query.id;

  //SQL查询 -- 多表(内)连接
  let sql = 'SELECT r.id,subject,content,created_at,nickname,avatar,article_number FROM xzqa_author AS u INNER JOIN xzqa_article  AS r ON  author_id = u.id WHERE r.id=?';
  //执行SQL语句
  pool.query(sql,[id],(err,results)=>{
    if(err) throw err;
    res.send({message:'查询成功',code:1,result:results[0]});
  });
});

//用户注册路由
server.post('/register',(req,res)=>{
  // res.send("ok")
  let username = req.body.username;
  let password = req.body.password;
  let sql = 'SELECT id FROM xzqa_author WHERE username=?';
  pool.query(sql,[username],(err,result)=>{
    if( err ) throw err;
    if(result.length==0){
      let seluname_sql = "INSERT INTO xzqa_author (username,password) VALUES(?,MD5(?))";
      pool.query(seluname_sql,[username,password],(err,result)=>{
        if( err ) throw err ;
        res.send({message:'注册成功',code:1})
      })
    }else{
      res.send({message:"用户名已存在",code:0})
    }
  })
}) 

// 用户登录路由
server.post('/login',(req,res)=>{
  // 获取地址栏的参数
  let username = req.body.username;
  let password = req.body.password;
  let sql = 'SELECT id,username,nickname,avatar FROM xzqa_author WHERE username=? and password=MD5(?)';
  pool.query(sql,[username,password],(err,result)=>{
    if( err ) throw err ;
    if(result.length===0){
      res.send({message:'用户名或密码错误',code:0})
    }else{
      res.send({message:"登录ok",code:1,info:result[0]})
    }
  })
})

// vuex的路由测试
server.get('/vuex',(req,res)=>{
  let results=[
    {
      productName:"华为手机",
      salePrice:21000
    },
    {
      productName:"小米手机",
      salePrice:1999
    }
  ]
  res.send({message:"数据ok",code:1,results:results})
})