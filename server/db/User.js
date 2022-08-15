const {Sequelize, Op} = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  name:{
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate:{
      notEmpty: true
    }
  },
  userType:{
    type: Sequelize.STRING,
    defaultValue: 'STUDENT',
    allowNull: false,
    validate:{
      isIn: [['STUDENT', 'TEACHER']]
    },
  },
  isStudent:{
    type: Sequelize.VIRTUAL,
    get(){
      return `${this.userType}` === 'STUDENT' ? true : false;
    },
    set(value) {
      throw new Error('Do not try to set the isStudent value!');
    }
  },
  isTeacher:{
    type: Sequelize.VIRTUAL,
    get(){
      return `${this.userType}` === 'TEACHER' ? true : false;
    },
    set(value) {
      throw new Error('Do not try to set the isTeacher value!');
    }
  },
});

User.findUnassignedStudents = async function(){
return await this.findAll(
    {
      where:{
        mentorId:{
          [Op.is]: null,
        },
        userType:{
          [Op.in]: ['STUDENT'],
        }
    }
  })
}

User.beforeUpdate(async (instance, options) => {
  const mentor = await User.findOne({where:{id:instance.mentorId}});
  console.log(mentor)
  if((instance._previousDataValues.mentorId !== null && instance._previousDataValues.userType === 'STUDENT') || mentor.userType === 'STUDENT'){
    throw new Error("Cannot update instance")
  }

})
/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;
