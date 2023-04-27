const db = require('../../plugins/mysql');
const TABLE = require("../../util/TABLE");
const STATUS = require("../../util/STATUS");
const { post } = require('../todo');
const moment = require("../../util/moment");
const { resData, currentTime, isEmpty } = require("../../util/lib");

//전체 row 갯수
const getTotal = async () => {
    try {
      const query = `SELECT COUNT(*) AS cnt FROM ${TABLE.B_MONTH}`;
      const [[{ cnt }]] = await db.execute(query);
      return cnt;
    } catch (e) {
      console.log(e.message);
      //throw e;
      return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
    }
};
  
// 페이징으로 가져오기
const getList = async (req) => {
    try {
        // 마지막 id, len 갯수
        const lastId = parseInt(req.query.lastId) || 0;
        const len = parseInt(req.query.len) || 5;
  
        let where = "";
        if (lastId) {
            // 0은 false
            where = `WHERE index_num < ${lastId}`;
        } 
        const query = `SELECT * FROM ${TABLE.B_MONTH} ${where} order by index_num desc limit 0, ${len}`;
        const [rows] = await db.execute(query);
        return rows;
    } catch (e) {
        console.log(e.message);
//        throw e;
        return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
    }
};

// row 존재유무
const getSelectOne = async (index_num) => {
    try {
        const query = `SELECT COUNT(*) AS cnt FROM ${TABLE.B_MONTH} WHERE index_num=?`;
        const values = [index_num];
        const [[{ cnt }]] = await db.execute(query, values);
        return cnt;
    } catch (e) {
        console.log(e.message);
        return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
    }
};


const bmonthController = {
    //개인 API : newcreate : DB에 새로운 정보가 입력되는데, 입력한 탄생월(month)에 따라 분기(quater)를 나눠서 자동으로 입력해주는 구조
    newcreate: async (req) =>{

        const { month_p } = req.body;
            //body check
            if (isEmpty(month_p)) {
                return resData( STATUS.E100.result, STATUS.E100.resultDesc, currentTime());
            }

            let values = [month_p];
            let query = `INSERT INTO b_month (month_p, quater) VALUES (?, ?)`;
            let quarter;

            try {
            //insert
                if (month_p > 0 && month_p <= 3) {
                    quarter = 1;
                } else if (month_p >= 4 && month_p <= 6) {
                    quarter = 2;
                } else if (month_p >= 7 && month_p <= 9) {
                    quarter = 3;
                } else if (month_p <= 12) {
                    quarter = 4;
                } else {
                    return resData( STATUS.E101.result, STATUS.E101.resultDesc, currentTime() );
                }
                values.push(quarter);

            const [rows] = await db.execute(query, values);
        
            console.log(rows);
            if (rows.affectedRows == 1) {
                return resData( STATUS.S200.result, STATUS.S200.resultDesc, currentTime() );
            }
        } catch (e) {
            console.log(e.message);
            return resData( STATUS.E300.result, STATUS.E300.resultDesc, currentTime() );
        }
        
    },



    // list
    list: async (req) => {
        const totalCount = await getTotal();
        const list = await getList(req);
        if (totalCount > 0 && list.length) {
            return resData(
                STATUS.S200.result,
                STATUS.S200.resultDesc,
                currentTime(),
                { totalCount, list }
            );
        } else {
            return resData(STATUS.S201.result, STATUS.S201.resultDesc, currentTime());
        }  
    },


    //update
    update: async (req) => {

        const { index_num } = req.params;
        let { mb_year } = req.body;
        //mb_year에 따라서, level값이 자동 변경된다.
        if(isEmpty(mb_year) || isEmpty(index_num)) {
            return resData(STATUS.E100.result, STATUS.E100.resultDesc, currentTime());
        }
        let values = [ mb_year, index_num ];
        let query = `UPDATE ${TABLE.B_MONTH} SET mb_year = ?, u_level = (CASE WHEN mb_year < 3 THEN 'B' WHEN mb_year >= 3 AND mb_year < 5 THEN 'S' WHEN mb_year >= 5 AND mb_year < 10 THEN 'G' WHEN mb_year >= 10 THEN 'D' END) WHERE index_num = ?`;

        try {
            const [rows] = await db.execute(query, values);

            if (rows.affectedRows == 1) {
                return resData( STATUS.S200.result, STATUS.S200.resultDesc, currentTime() );
            }
        } catch (e) {
            console.log(e);
            return resData( STATUS.E300.result, STATUS.E300.resultDesc, currentTime() );
        }

        /*
        //mb_year값과 u_level을 각각 입력해줘야 하는 코드
        const { index_num } = req.params; 
        const { mb_year, u_level } = req.body;

        if (isEmpty(index_num) || isEmpty(mb_year) || isEmpty(u_level)) {
            return resData(STATUS.E100.result, STATUS.E100.resultDesc, currentTime());
        }

        console.log(index_num);
        console.log(mb_year);
        console.log(u_level);

        try {
            const query = `UPDATE ${TABLE.B_MONTH} SET mb_year=?, u_level=? WHERE index_num= ?`;
            const values = [ mb_year, u_level, index_num ];
            const [rows] = await db.execute(query, values);

            if (rows.affectedRows == 1) {
                return resData(
                STATUS.S200.result,
                STATUS.S200.resultDesc,
                currentTime()
                );
            }
        } catch (e) {
            console.log(e.message);
            return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
        }
        */
    },



    //delete
    delete: async (req) => {
        const { index_num } = req.params; // url /로 들어오는것
        if (isEmpty(index_num)) {
            return resData(STATUS.E100.result, STATUS.E100.resultDesc, currentTime() );
        }
        const cnt = await getSelectOne(index_num);
        try {
            if (!cnt) {
                return resData(
                    STATUS.E100.result,
                    STATUS.E100.resultDesc,
                    currentTime()
                );
            }
            const query = `DELETE FROM ${TABLE.B_MONTH} WHERE index_num = ?;`;
            const values = [index_num];
            const [rows] = await db.execute(query, values);
            if (rows.affectedRows == 1) {
                return resData(
                    STATUS.S200.result,
                    STATUS.S200.resultDesc,
                    currentTime()
                );
            }
        } catch (e) {
            console.log(e.message);
            return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
        }
        return rows;
    }


}
module.exports = bmonthController;