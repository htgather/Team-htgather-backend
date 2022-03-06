const express = require('express');
const Room = require('../models/room');
const User = require('../models/user')
const router = express.Router();

// 방생성
router.post('/rooms', async (req, res) => {
    const { creator,roomTitle,videoThumbnail,videoLength,videoUrl,videoTitle,videoStartAfter,category,difficulty } = req.body;
    
    if (!(creator && passroomTitleord && videoThumbnail && videoLength && videoUrl && videoTitle && videoStartAfter && category && difficulty)) {
        return res.status(400).json({ message:"정확히 입력해주세요!" })
    } else if (roomTitle.length>50) {
        return res.status(400).json({ message:"글자 수 제한입니다." })
    }
    
    const createRoom = await Room.create({ creator,roomTitle,videoThumbnail,videoLength,videoUrl,videoTitle,videoStartAfter,category,difficulty });

    res.status(201).json({ room: createarticle });
})

// 방입장하기
router.post('/rooms/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const { userId } = res.locals.user;
  const [existroom] = await Room.find({ roomId })
  const [user] = await User.find({userId})
  try {
      if (existroom)
        return res.status(400).send({
          message: "이미 입장한 방입니다.",
        });
  
      if (!existroom)
        return res.status(400).send({
          message: "존재하지 않는 방입니다.",
        });
  
      if ( existroom.numberOfPeopleInRoom> 6) {
        return res.status(400).send({
          message: "입장불가, 5명 초과",
        });
      }
  await Room.findOneAndUpdate({ roomId: roomId }, {'$inc': {'numberOfPeopleInRoom': 1}});
      // await PersonInRoom.create({ userId, roomId, nick }); ---> 새로운 스키마가 생길때
      return res.status(201).send({ message: "입장 완료" });
    } catch (err) {
      res.status(400).send({
        message: "방 입장에 실패하였습니다.",
      });
    }
});

//방 나가기
router.delete('/rooms/exit/:roomId', async (req, res) => {
  const { roomId } = req.params
  const [existroom] = await Room.find({ roomId })
  try {
    if (!existroom.numberOfPeopleInRoom) {
      return await Room.deleteOne({ roomId})
    }
await Room.findOneAndUpdate({ roomId: roomId }, {'$inc': {'numberOfPeopleInRoom': -1}});
    // await PersonInRoom.create({ userId, roomId, nick }); ---> 새로운 스키마가 생길때
    return res.status(201).send({ message: "운동 끝" });
  } catch (err) {
    res.status(400).send({
      message: "방 나가기에 실패하였습니다.",       /* ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ */
    });
  }
});



//방 목록 불러오기 (카테고리, 난이도별로 구분해서 보내주기)
router.get('/rooms?category={category}?difficulty={difficulty}', async (req, res) => {    
    const rooms = await Room.find({"category": req.params.category, "difficulty": req.params.difficulty});
    
    //프론트에서 원하는 방식으로 가공해서 보내줘야 함 (날짜부분??).
    res.json({
        rooms: rooms
    });
});




module.exports = router
