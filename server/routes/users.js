const router = require('express').Router();
const {
  models: { User },
} = require('../db');

router.get('/unassigned', async (req, res, next) =>{
  try{
    const users = await User.findUnassignedStudents();
    res.send(users)
  }catch(err){
    next(err);
  }
})

router.get('/teachers', async (req, res, next) =>{
  try{
        res.send(await User.findTeachersAndMentees());
  }catch(err){
    next(err);
  }
})

router.delete('/:id', async (req, res, next) => {
  try{
    if(isNaN(parseInt(req.params.id, 10))){
      res.sendStatus(400)
    }
    const user = await User.findByPk(req.params.id);
    if(!user){
      res.sendStatus(404);
    } else {
      await user.destroy();
      res.sendStatus(204);
    }
  } catch(err){
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const [newUser, wasCreated] = await User.findOrCreate({where:{name: req.body.name}});
    if(wasCreated){
        res.status(201).send(newUser);
      }
      res.sendStatus(409)
    } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) =>{
  try{
    const user = await User.findByPk(req.params.id);
        if (!user) res.sendStatus(404);
        await user.set(req.body).save();
        res.status(200).send(user);
  }
  catch(err){
    next(err);
  }
})

User.findTeachersAndMentees = async function(){
    const teachers = await this.findAll({
      where:{
        userType: 'TEACHER'
      },
      include:{
        model: User,
        as: 'mentees',
        foreignKey: 'mentorId',
      }
    });
    return teachers;
}
/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:

module.exports = router;
