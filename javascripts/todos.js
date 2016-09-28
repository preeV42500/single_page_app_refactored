var App = {
  $el: $("main"), // cache a parent element that can be used to scope selectors
  $todos: $("#todos"), // cache ul container that todo views will be appended to
  newTodo: function(e) {
    e.preventDefault();
    var name = $(e.target).find("#todo_name").val(),
        model, view;

    if (!name) { return; }

    model = this.Todos.add({ // create new model and add it to the collection
      name: name,
      complete: false
    });
    view = new this.TodoView(model); // create new view based on model
    this.$todos.append(view.$el);

    e.target.reset();
  },
  editTodo: function(e) {
    var $edit_form = $(templates.todo_edit(this.model.attributes));
    this.$el.after($edit_form);
    this.$el.remove();

    $edit_form.on("blur", "input", App.saveEdit.bind(this)); // delegate blur event to list item
  },
  saveEdit: function(e) {
    var name = $(e.target).val(),
        $li = $(e.target).closest("li");
    this.model.set("name", name); // reset the model with value from input
    $li.after(this.$el);
    $li.remove();
    $(e.target).off(e);
  },
  toggleComplete: function(e) {
    this.model.set("complete", !this.model.get("complete")); // set the 'complete' property on the model to the opposite of what it is
    this.$el.toggleClass("complete"); // toggle the complete class on the list item
    return false;
  },
  clearCompleted: function(e) {
    e.preventDefault();
    var completed = this.Todos.models.filter(function(model) {
      // filter models in collection that have 'complete' set to true
      return model.attributes.complete;
    });

    completed.forEach(function(model) {
      this.Todos.remove(model);
    }.bind(this));
  },
  bind: function() {
    this.$el.find("form").on("submit", this.newTodo.bind(this));
    this.$el.find("#clear").on("click", this.clearCompleted.bind(this));
  },
  init: function() {
    this.bind();
  }
};

var templates = {};

// compile Handlebars templates and store them on the templates object
$("[type='text/x-handlebars']").each(function() {
  var $t = $(this);
  templates[$t.attr("id")] = Handlebars.compile($t.html());
});


// Todo model constructor; used in todos collection
App.TodoConstructor = new ModelConstructor();

// Todos collection constructor
App.TodosConstructor = new CollectionConstructor();

// collection created using collection constructor with model constructor as argument
App.Todos = new App.TodosConstructor(App.TodoConstructor);

// the todo view constructor; used to create a new view for each model
App.TodoView = new ViewConstructor({
  tag_name: "li",
  template: templates.todo,
  events: {
    "click a.toggle": App.toggleComplete,
    "click": App.editTodo
  }
});

App.init();
