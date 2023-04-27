const router = require('express').Router();
const bmonthController = require('./_controller/bmonthController');


//개인 API
router.post('/', async (req,res)=>{
    const result = await bmonthController.newcreate(req);
    res.json(result);
})

// list
router.get('/', async (req,res)=>{
    const result = await bmonthController.list(req);
    res.json(result);
});

// update
router.put('/:index_num', async (req,res)=>{
    const result = await bmonthController.update(req);
    res.json(result);
});

// delete
router.delete('/:index_num', async (req,res)=>{
    const result = await bmonthController.delete(req);
    res.json(result);
})

module.exports = router;