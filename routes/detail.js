const express = require('express');
const router = express.Router();
const authmiddlewares = require('../middlewares/auth-middleware');
const WorkOutTimes = require('../models/workOutTimesSchema');

//운동 시간 기록
router.post('/records', authmiddlewares, async (req, res) => {
    const { user } = res.locals;
    const { workOutTime } = req.body;
    await WorkOutTimes.create({ userId: user.userId, doneAt: new Date(), workOutTime: workOutTime.workOutTime});
    
    res.send({
        message: "운동시간기록 성공"
      }
      );
});


//달력 내용 전달
router.get('/calendar', authmiddlewares ,async (req, res) => {
    const { user } = res.locals;

    const year = new Date().getFullYear;
    const month = new Date().getMonth;
    const lastDay = new Date();
                                                                                                                                    //해당 월의 마지막 일 넣기
    // const calendar = await WorkOutTimes.find({"date": {$gte: ISODate(year + month + "-01T00:00:00.000Z"), $lte: ISODate(year + month + "-31T00:00:00.000Z")}, {userId : user.userId}})
    const calendar = await WorkOutTimes.find({"userId" : user.userId},{"_id": false ,"donetAt" : true});
    
    //프론트에서 원하느 방식으로 가공해서 보내줘야 함.
    res.json({
        calendar: calendar
    });
});



module.exports = router;