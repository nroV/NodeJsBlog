const express = require('express')
const app = express()
const upload = require('express-fileupload')
const router = express.Router()
const IP = require('ip');


const db = require('../data/database')
const session = require('express-session')

router.get('/ipaddress',(req,res)=>{
    const ipAddress = IP.address();

    res.send(ipAddress)
})
router.get('/', async (request, response) => {
    // const homepage = path.join(__dirname,'views','index.html')

    let sql = "SELECT p.*, c.type from posts p INNER JOIN category c ON p.category_id = c.id LIMIT 4 ;";

    let sql_two = "SELECT p.*, c.type from posts p INNER JOIN category c ON p.category_id = c.id  order by title asc limit 1;";

    let sql_three = "SELECT p.*, c.type from posts p INNER JOIN category c ON p.category_id = c.id order by views desc LIMIT 4;";

    let sql_cate = "SELECT * from category;"

    const [posts] = await db.query(sql)
    const [category] = await db.query(sql_cate)
    const [singles] = await db.query(sql_two)
    const [popular] = await db.query(sql_three)
    // const [popularpost] = popular;

    const singlepost = {
        ...singles[0],
        datetostring: singles[0].date.toLocaleDateString(),
        title: singles[0].title.trim(),
        contents: singles[0].content.substring(1, 70),
        type: singles[0].type,
        img: singles[0].images,
        author :singles[0].authorname
    }
    response.render('post', {
        posts: posts,
        single: singlepost,
        popular: popular,
        category: category,
        islogin:false,
        userid : false,
        session: request.session    
   

    })
})

router.get('/create-post', async (request, response) => {
    // const homepage = path.join(__dirname,'views','index.html')
    let sql = "SELECT * FROM category;";

    const [category] = await db.query(sql)
    const data = request.body;


    response.render('create', {
        category: category,
        session: request.session
   
    })
})


router.get('/signup', async (request, response) => {
    // const homepage = path.join(__dirname,'views','index.html')
    let sql = "SELECT * FROM category;";

    const [category] = await db.query(sql)
    const data = request.body;


    response.render('signup', {
        category: category,
    })
})

router.get('/login', async (request, response) => {
    // const homepage = path.join(__dirname,'views','index.html')
    let sql = "SELECT * FROM category;";

    const [category] = await db.query(sql)
    const data = request.body;


    response.render('login', {
        category: category,
        session: request.session,
        wrong:""
    })
})

router.post('/loginuser', async (request, response) => {
    // const homepage = path.join(__dirname,'views','index.html')
    let sql = "SElECT * from user;";
    let check = true;
    const [login] = await db.query(sql)
    for (const alluser of login) {
        if (alluser.email === request.body.email && alluser.password === request.body.password) {
            // session.userid = alluser.id
          
            request.session.userid = alluser.id
            response.redirect('/')
          
       
        
            // if(alluser.email != request.body.email){
           
            //     response.redirect('/login',{
            //         wrong:"your email is incorrect"
            //     })
            // }

            // else if(alluser.password!= request.body.password){
        
            //     response.redirect('/login',{
            //         wrong:"your password is incorrect"
            //     })
            // }

            check = false

            break;  
        }
    }
    if(check == true){
   
        response.redirect('/notfound')

    }
  





})
router.post('/post/comment/:id', async (request, response) => {
    // const homepage = path.join(__dirname,'views','index.html')
  const postid = request.params.id;
  const userid =   request.session.userid;
  
  console.log(postid)
  console.log(userid)
    
    if(!request.session.userid){
        response.redirect('/login')
    }
    else{
        let sql = "INSERT INTO comments(cmt_desc,post_id,user_id) VALUES(?,?,?);";
         await db.query(sql,[request.body.txtarea,postid,userid ])
         response.redirect(`/postdetails/${ postid }/1#commentsection`)
    }




})

router.get('/notfound',(request, response)=>{
    response.render("Usernotfound")
})



// router.get('/postdetail/:id', async (request, response) => {

//     let sql = "SELECT p.*, a.name AS authorname from posts p INNER JOIN authors a ON p.author_id = a.id WHERE p.id = ?;"
//     const [posts] = await db.query(sql, [request.params.id])

//     const postdetail = {
//         ...posts[0],
//         datetostring: posts[0].date.toLocaleDateString(),
//         contents: posts[0].content.trim()
//     }
//     // const homepage = path.join(__dirname,'views','index.html')
//     response.render('detail', {
//         posts: postdetail
//     })
// })

router.get('/logout',(req,res,next)=>{
    req.session.destroy()
    res.redirect('/')
})
router.get('/postdetails/:id/:load', async (request, response) => {
    let load = request.params.load
    load = Number(load) +1
    // console.log('load',load)
    const userid =   request.session.userid;
    let sql_three = "SELECT p.*, c.type from posts p INNER JOIN category c ON p.category_id = c.id order by views desc LIMIT 4;";
    let sql = "SELECT p.*, c.type from posts p INNER JOIN category c ON p.category_id = c.id WHERE p.id = ?;"
    let sql_two = "SELECT p.*, c.type from posts p INNER JOIN category c ON p.category_id = c.id  order by title asc limit 3;";
    let updateview = "UPDATE posts SET views = views+1 WHERE id = ? ;"
    let comment = `SELECT c.*, p.content, u.username ,u.pf from comments c INNER JOIN posts p ON c.post_id = p.id  INNER JOIN  user u ON c.user_id = u.id WHERE p.id= ? LIMIT ${load};`
    let name = 'SELECT u.username from comments c INNER JOIN posts p ON c.post_id = p.id  INNER JOIN  user u ON c.user_id = u.id WHERE u.id = ? LIMIT 1;'
   
    const [username ] = await db.query(name,[userid])
    const [cmt] = await db.query(comment,[request.params.id])
    const [posts] = await db.query(sql, [request.params.id])
    const [recent] = await db.query(sql_three)
    const [more] = await db.query(sql_two)
    await db.query(updateview, [request.params.id])

    let sql_cate = "SELECT * from category;"
    const [category] = await db.query(sql_cate)
    let user
    if(username.length > 0 ){
       user = {
            ...username[0],
            name:username[0].username
        }
    
    }
 
    const post = {
        ...posts[0],
        title: posts[0].title.trim(),
        summary: posts[0].summary.trim(),
        content: posts[0].content.trim(),
        date: posts[0].date.toLocaleDateString(),
        image: posts[0].images,
        cid: posts[0].category_id,
        type: posts[0].type,
        view: posts[0].views
    }

    const f = new Intl.RelativeTimeFormat ("en-us",{
        style:"long",
        numeric:"always"
    })



    response.render('details', {
        posts: post,
        category: category,
        recent: recent,
        more: more,
        comments:cmt,
        page:load,
        session: request.session,
        postname:user
    })
})

// router.post('/insert/:id',async(req,res)=>{  
//     let sql = "SELECT p.*, c.type from posts p INNER JOIN category c ON p.category_id = c.id WHERE p.id = ?;"
//     const [posts] = await db.query(sql, [request.params.id])

//     const post = {
//         ...posts[0],
//         title:posts[0].title.trim(),
//         summary:posts[0].summary.trim(),
//         content:posts[0].content.trim(),
//         date:posts[0].date.toLocaleDateString(),
//         image:posts[0].images,
//         cid:posts[0].category_id,
//         type:posts[0].type,
//         view:posts[0].views
//     }
//     let insertview = "INSERT INTO posts(title,summary,content,date,images,category_id,views) VALUES(?,?,?,?,?,?,?) WHERE id =? "
//     await db.query(insertview,[post.title,post.summary,post.content,post.date,post.image,post.cid,post.view+1,request.params.id])

//     res.redirect(`/postdetails/${request.params.id}`)
// })
// router.get('/postdetail/:id/edit', async (request, response) => {



//     let sql = "SELECT p.*, a.name AS authorname from posts p INNER JOIN category a ON p.category_id = a.id WHERE p.id = ?;"
//     const [posts] = await db.query(sql, [request.params.id])
//     let sql2 = "SELECT * FROM category";
//     const [author] = await db.query(sql2)
//     const postdetail = {
//         ...posts[0],
//         datetostring: posts[0].date.toLocaleDateString(),
//         contents: posts[0].content.trim()
//     }
//     // const homepage = path.join(__dirname,'views','index.html')
//     response.render('update', {
//         posts: postdetail,
//         authors: author
//     })
// })
// router.post('/post/:id/delete',async(req,res)=>{
//     let sql = "DELETE FROM posts WHERE id = ? "
//     await db.query(sql,[req.params.id])
//     res.redirect('/post')
// })

// router.post('/postitem', async (request, response) => {
//     // const homepage = path.join(__dirname,'views','index.html')

//     if(request.files){
//             const file = request.files.file
//             const filename = file.name
//             const data = [
//                 request.body.title,
//                 request.body.sum,
//                 request.body.content,
//                 request.body.author,
//                 filename

//             ]
//             if(filename){
//                 file.mv('public/uploads/'+filename,(err)=>{
//                     if(err){
//                         console.log(err)
//                     }
//                     else{

//                     }
//                 })
//                 let sql = "INSERT INTO posts (title,summary,content,author_id,images) VALUES(?)";
//                 const result = await db.query(sql, [data])
//                 response.redirect('/post')
//             }
//     }








// })

// router.post('/updatepost', async (request, response) => {


//     let sql = "UPDATE posts SET title = ? , summary =? ,content=?, author_id=? WHERE id = ? ;";



//     await db.query(sql, [request.body.title, request.body.sum, request.body.content, request.body.author, request.body.id,])

//     response.redirect('/post')





// })
router.post('/comment/delete/:cid/:pid',async(request,response)=>{
    let cmt = "DELETE FROM comments WHERE id = ?"
    await db.query(cmt,[request.params.cid])
    response.redirect(`/postdetails/${request.params.pid }/1#commentsection`)
})
router.get('/post/:cid', async (request, response) => {
    const cid = request.params.cid;
    let sqli = "SELECT * from category;"
    let categoryid = "SELECT * from category WHERE id = ?;"
    const [single] = await db.query(categoryid, [cid]);
    const spread = {
        ...single[0],
        categoryname: single[0].type
    }
    let sql = "SELECT p.*, c.type from posts p INNER JOIN category c ON p.category_id = c.id WHERE c.id = ? order by views desc LIMIT 8;";
    const [categories] = await db.query(sql, [cid])
    const [category] = await db.query(sqli)
    response.render("postcategory", {
        category: category,
        post: categories,
        single: spread,
        session: request.session
    })
    // const homepage = path.join(__dirname,'views','index.html')

})
router.get('/filter/:title', async (request, response) => {
    let sqli = "SELECT * from category;"
    const [category] = await db.query(sqli)
    let title = request.params.title;
    let sql = `SELECT p.*, c.type from posts p INNER JOIN category c ON p.category_id = c.id WHERE p.title like "%${request.params.title}%" order by views desc LIMIT 8;`;
    let [result] = await db.query(sql)
    response.render("filter", {
        category: category,
        posting: result,
        session: request.session
    })

})
router.post('/postitem', async (request, response) => {
    if (request.files) {
        const file = request.files.file
        const filename = file.name
        const data = [
            request.body.title,
            request.body.sum,
            request.body.content,
            request.body.author,
            filename,
            1

        ]





        if (filename) {
            file.mv('public/uploads/' + filename, (err) => {
                if (err) {
                    console.log(err)
                }
                else {

                }
            })

        }
        let sql = "INSERT INTO posts (title,summary,content,category_id,images,views) VALUES(?)";
        const result = await db.query(sql, [data])
        response.redirect('/')
    }


}





)
router.post('/search', async (request, response) => {
    const title = request.body.search
    let sqli = "SELECT * from category;"



    const [category] = await db.query(sqli)
 
    response.redirect(`/filter/${title}`)
    // const homepage = path.join(__dirname,'views','index.html')

})
router.post('/signup/post', async (request, response) => {
       const file = request.files.file;
       const fn = file.name
       if(file) {
            const email = request.body.email
            const username  = request.body.username
            const password   = request.body.password
        
            if( fn ){
                file.mv('public/uploads/' + fn, (err) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
    
                    }
                })
                let sql = "INSERT INTO user (email,username,password,pf) VALUES(?,?,?,?);";
                await db.query(sql, [email,username,password,fn])
                response.redirect('/login')

            }

       }
    // const homepage = path.join(__dirname,'views','index.html')

})


module.exports = router;