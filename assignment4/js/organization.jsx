var Event = React.createClass({
  render:function () {
    return (
      <div className="test">
        <div className="col-md-6">
          <h4 className="eventName">
            {this.props.name}
          </h4>
        </div>
        <div className="col-md-6">
          <h4 className="eventDate">
            {this.props.date}
          </h4>
        </div>
      </div>
    );
  }
});


window.onload = function(){
ReactDOM.render(
  <Event name="visit audrey" date="next month" />,
  document.getElementById('event-list')
);
ReactDOM.render(
  <Event name="Autism Awarness Day" date="next month" />,
  document.getElementById('event-list')
);
};
