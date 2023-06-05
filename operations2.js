const { compile } = require("ejs");
const { pool } = require("./dbConfig.js");

module.exports = {

    getNextTime: async function(date, hour){
      const iStart = date[6]+"/"+date[8]+date[9]+"/"+date[0]+date[1]+date[2]+date[3];
      const result = await pool.query(`SELECT * FROM "Operacoes" 
                WHERE "date" = $1 AND "time" = $2`,[iStart, hour]
      );
      if (!result || !result.rows || !result.rows.length) return [];
      return result.rows[0];
    }
}