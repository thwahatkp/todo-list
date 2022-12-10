const express = require("express");

// const ejs = require('ejs')

const _ = require('lodash');

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

mongoose.connect("mongodb://127.0.0.1/todolistDB", {
  useNewUrlParser: true,
});

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));

app.set("view engine", "ejs");

const itemsSchema = {
  name: String,
};

Items = mongoose.model("items", itemsSchema);

item1 = new Items({
  name: "Welcome to you todolist.",
});

item2 = new Items({
  name: "Hit the + button to add a new item.",
});

item3 = new Items({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  Items.find((err, data) => {
    if (data.length === 0) {
      Items.insertMany(defaultItems, () => {
        console.log("inserted");
      });
      res.redirect("/");
    } else {
      res.render("index", { listTitle: "Today", newListItems: data });
    }
  });
});
app.post("/", (req, res) => {
  const itemName = req.body.item;
  const listName = req.body.list;

  if (itemName != "") {
    item = new Items({
      name: itemName,
    });
  }

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundItem) => {
      foundItem.items.push(item);
      console.log(foundItem);
      foundItem.save();
      res.redirect('/' + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedId = req.body.checkbox;
  const list = req.body.list;
  if(list === "Today"){
    Items.findByIdAndRemove(checkedId, (err) => {
      if (!err) {
        console.log("Successfully Deleted ");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  }else{
    List.findOneAndUpdate({name:list},{$pull:{items:{_id:checkedId}}},(err,found)=>{

      if(!err){
        res.redirect('/'+list);
      }

    })
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // Creat a new list

        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show an existing list
        res.render("index", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});


let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000
}
app.listen(port, () => {
  console.log("sever started on port 3000");
});
