const express = require("express");
const bodyParser = require("body-parser");
const  _ = require("lodash");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/todoDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);
// let datFromUsers = [ ];
// let datFromWork = [ ];

const item1 = new Item({
  name: "welcome to your todolist.",
});

const listSchema = {
  name: String ,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);




// Item.insertMany(defualtItems , function(err){
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("successfully saved default items to database");
//     }
// });

app.get("/", function (req, res) {
  Item.find({}, function (err, founditems) {
    if (founditems.length === 0) {
      Item.insertMany(item1, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved default items to database");
        }
      });
      res.redirect("/");
    } else {
        res.render("list", { kindOfDay: "Today", newThing: founditems });
    }
    
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.button;

  const item5 = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item5.save();
    res.redirect("/");
  }else {
    List.findOne({name :listName}, function(err,foundList){
      foundList.items.push(item5);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete" , function(req ,res){
  const checkbox= req.body.checkbox
  const listName = req.body.listName
  if(listName=== "Today") {
    Item.findByIdAndRemove(checkbox ,function(err){
      if(!err){
        console.log("Successfully deleted  checked item.");
        res.redirect("/")
      }
    });
  } else {
    List.findOneAndUpdate({name: listName} , {$pull : {items : {_id :checkbox }}}, function(err , founList){
      if(!err){
        res.redirect("/" + listName)
      }
    });
  }
});

app.get("/:customroute", function(req,res){
  customroute= _.capitalize(req.params.customroute);
  List.findOne({name : customroute},function(err , foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customroute,
          items: item1
        });
        list.save();
        res.redirect("/" + customroute);
      }
      else{
        res.render("list", { kindOfDay: foundList.name , newThing: foundList.items})
      }
  }});
 
});

app.listen(3000, function () {
  console.log("server is running in 3000 port");
});
