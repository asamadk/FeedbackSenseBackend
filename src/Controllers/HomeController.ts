import express from 'express';

const router = express.Router();

router.post('/invite',(req,res) => {
    console.log('Invite people email', req.params );
});

export default router;