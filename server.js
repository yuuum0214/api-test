const config = require('./config')[process.env.NODE_ENV]; 
const express = require('express');
const http = require('http');

const app = express();
const port = config.PORT;
//const router = express.Router();
//const todoRouter = require('./api/todo');
const cors = require('cors');
const autoRoute = require('./autoRoute');

/*
router.get('/',(req,res)=>{
    res.json({
        status : 200,
        data: 'success',
    })
})
*/

//cors
let corsOptions = {
	origin: '*', // 출처 허용 옵션
	credential: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
};

app.use(cors(corsOptions));
//body parser
app.use(express.json());
app.use(express.urlencoded({extended : true }));

//app.use('/api',todoRouter);
autoRoute('/api',app);

//server
const webServer = http.createServer(app);
webServer.listen(port,()=>{
    console.log(`http://localhost:${port}`);
})