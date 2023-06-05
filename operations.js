const { compile } = require("ejs");
const { pool } = require("./dbConfig.js");
//const { pool2 } = require("./dbConfig.js");

module.exports = {
    plab: async function(it, preg, opeNum){
      var iStart = {};
      if(it[8] === '0')
        iStart = it[6]+"/"+it[9]+"/"+it[0]+it[1]+it[2]+it[3];  
      else
        iStart = it[6]+"/"+it[8]+it[9]+"/"+it[0]+it[1]+it[2]+it[3];
      
      const result = await pool.query(`SELECT * FROM "OperacoesPorBloco2" 
                WHERE "date" = $1 AND "ES" = $2 AND "opeNum" = $3`,[iStart, "E", opeNum]
      );
      if (!result || !result.rows || !result.rows.length) return [];
      return result.rows[0];
    },

    getNextTime: async function(date, hour){
      var iStart = date;

      const result = await pool.query(`SELECT * FROM "OperacoesPorBloco2" 
                WHERE "date" = $1 AND "time" = $2`,[iStart, hour]
      );
      if (!result || !result.rows || !result.rows.length) return [];
      return result.rows[0];
    }
};