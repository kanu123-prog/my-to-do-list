

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash')



const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-kanupriya:kanu1234@kanupriya-cluster.7x4najw.mongodb.net/listdb?retryWrites=true&w=majority");
const itemSchema = new mongoose.Schema({
  name:String,
});


const Item = mongoose.model("item",itemSchema);

  const item1 = new Item({
    name:"Welcome to your toDoList"
  });
  const item2 = new Item({
    name:"Hit the + button to add items to your list"
  });
  const item3 = new Item({
    name:"<--- hit this to delete"
  });

  const defaultItems = [item1,item2,item3];

  const listSchema={
    name:String,
    items: [itemSchema]
  }
  
  const List = mongoose.model("list",listSchema)

app.get("/", function(req, res){
  Item.find({}).then(function(FoundItems){
    if(FoundItems.length===0){
      Item.insertMany(defaultItems);
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "today", newListItems:FoundItems});
    }
  })
})

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}).then(function(foundItem){
    if(!foundItem){
      //create a new list
      const list = new List({
        name: customListName,
        items : defaultItems
      })
      list.save()
      res.redirect("/" + customListName)
    }
    else{
      //show ana existing list
      res.render("list", {listTitle: foundItem.name, newListItems:foundItem.items});
    }
  })
  
  
})

app.post("/", function(req, res){

  const itemName=req.body.newItem;
  const listTitle=req.body.list
  const item = new Item({
    name: itemName
  })

  if(listTitle==="today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({ name: listTitle }).then(function(foundList) {
      if (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listTitle);
      } else {
        console.error("List not found");
        // Handle the case when the list is not found, e.g., redirect or send an error response
      }
    });
  }

  
});
app.post("/delete", async function(req, res) {
  try {
    const delItem = req.body.checkbox;
    const listName = req.body.listName;
    
    if (listName === "today") {
      await Item.findByIdAndDelete(delItem);
      res.redirect("/");
    } else {
      await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: delItem } } }).then(function(foundList) {
        if (foundList) {
          res.redirect("/" + listName);
        } else {
          console.error("List not found");
          // Handle the case when the list is not found, e.g., redirect or send an error response
          res.redirect("/");
        }
      });
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    res.redirect("/");
  }
});







app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
