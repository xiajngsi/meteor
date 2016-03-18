/*
if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
*/
Tasks = new Mongo.Collection("tasks");

if(Meteor.isServer) {
    Meteor.publish("tasks", function() {

        return funciton()
        {
            console.log("server");
            Tasks.find({
                $or: [
                    {private: {$ne: true}},
                    {owner: this.userId}
                ]
            });
        }
    });
}

if(Meteor.isClient) {

  //提交表单中的新增的task
  Template.body.events({
    "submit .new-task": function (event) {
      //阻止浏览器的默认提交事件
      event.preventDefault();

      //从表单元素中获取值
      var text = event.target.text.value;

      //插入task到collection
      Meteor.call("addTask", text);

      //清楚表单
      event.target.text.value = "";

    },
    "change .hide-completed input": function (event) {
        Session.set("hideCompleted", event.target.checked);
    }
  });


   Template.task.events({
     "click .toggle-checked": function () {
       Meteor.call("setChecked", this._id, !this.checked);
     },
     "click .delete": function () {
       Meteor.call("deleteTask", this._id);
     },
       "click .toggle-private": function () {
           Meteor.call("setPrivate", this._id, ! this.private);
       }

   });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });

    Template.task.helpers({
        isOwner: function() {
            return this.owner === Meteor.userId();
        }
    });

    Template.body.helpers({
        tasks: function() {

            if(Session.get("hideCompleted")) {
                console.log("查找1");
                return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
            } else {
                console.log("查找3"  + Tasks.find().count());
                return Tasks.find().count();

            }
        },
        hideCompleted: function () {
            console.log("查找2");
            return Session.get("hideCompleted");
        }
    });
};



Meteor.methods({
    addTask: function(text) {
        if(!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        };


        Tasks.insert({
            text: text,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username
        });
        console.log("insert" +
            "comp");
    },
    deleteTask: function (taskId) {
        var task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can delete it
            throw new Meteor.Error("not-authorized");
        };

        Tasks.remove(taskId);
    },
    setChecked: function (taskId, setChecked) {
        var task = Tasks.findOne(taskId);
        if (task.private && task.owner !== Meteor.userId()) {
            // If the task is private, make sure only the owner can check it off
            throw new Meteor.Error("not-authorized");
        };

        Tasks.update(taskId, {$set: {checked: setChecked}});
    },
    setPrivate: function (taskId, setToPrivate) {
        var task = Tasks.findOne(taskId);
        //确定task只有一个拥有者似的它是private的
        if(task.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        };

        Tasks.update(taskId, {$set: {private: setToPrivate}});
    }
});