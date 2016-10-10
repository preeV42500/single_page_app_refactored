var App = {
  $el: $("main"), // cache a parent element that can be used to scope selectors
  $todos: $("#todos"), // cache ul container that todo views will be appended to
  newTodo: function(e) {
    e.preventDefault();
    var name = $(e.target).find("#todo_name").val(),
        model, view;

    if (!name) { return; }

    model = this.Todos.add({ // create new model and add it to the collection
      name: name
    });
    view = new this.TodoView({ model: model }); // create new view based on model
    this.$todos.append(view.$el);

    e.target.reset();
  },
  clearCompleted: function(e) {
    e.preventDefault();
    var incomplete = App.Todos.where({ complete: false }); // filter out incomplete items

    App.Todos.set(incomplete); // reset the collection to just the incomplete items

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
(function() {
  var id = 1;

  var todo_model = Backbone.Model.extend({
    idAttribute: "id",
    defaults: {
      complete: false
    },
    initialize: function() {
      this.set("id", id);
      id++;
    }
  });

  App.Todo = todo_model;
})();

// Todos collection
App.Todos = new Backbone.Collection([], {
  model: App.Todo
});

// the todo view constructor; used to create a new view for each model
App.TodoView = Backbone.View.extend({
  tagName: "li",
  template: templates.todo,
  events: {
    "click a.toggle": "toggleComplete",
    "click": "editTodo"
  },
  render: function() {
    this.$el.attr("data-id", this.model.get("id"));
    this.$el.html(this.template(this.model.toJSON()));
  },
  editTodo: function(e) {
    var idx = +$(e.target).attr("data-id"),
        model = App.Todos.get(idx),
        $edit_form = $(templates.todo_edit(model.toJSON()));
    this.$el.after($edit_form);
    this.$el.remove();

    $edit_form.find("input").focus(); // autofocus input field
    $edit_form.on("blur", "input", this.saveEdit.bind(this)); // delegate blur event to list item
  },
  saveEdit: function(e) {
    var $input = $(e.target),
        name = $input.val(),
        $li = $input.closest("li");

    this.model.set("name", name); // reset the model with value from input
    $li.after(this.$el);
    $li.remove();
    $input.off(e);
    this.delegateEvents(); // rebind events to view
  },
  toggleComplete: function(e) {
    var $li = $(e.target).closest("li"),
        idx = +$li.attr("data-id"),
        model = App.Todos.get(idx);

    model.set("complete", !model.get("complete")); // set the 'complete' property on the model to the opposite of what it is
    $li.toggleClass("complete", model.get("complete")); // toggle the complete class on the list item
    return false;
  },
  initialize: function() {
    this.render();
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model, "remove", this.remove);
  }
});

App.init();
