var Event = React.createClass({
  displayName: "Event",

  render: function () {
    return React.createElement(
      "div",
      { className: "test" },
      React.createElement(
        "div",
        { className: "col-md-6" },
        React.createElement(
          "h4",
          { className: "eventName" },
          this.props.name
        )
      ),
      React.createElement(
        "div",
        { className: "col-md-6" },
        React.createElement(
          "h4",
          { className: "eventDate" },
          this.props.date
        )
      )
    );
  }
});

window.onload = function () {
  ReactDOM.render(React.createElement(Event, { name: "visit audrey", date: "next month" }), document.getElementById('event-list'));
  ReactDOM.render(React.createElement(Event, { name: "Autism Awarness Day", date: "next month" }), document.getElementById('event-list'));
};