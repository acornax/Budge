(function() {
  var app;

  app = angular.module("Budge", ["ngResource"]);

  app.factory('Expenses', ['$resource', function($resource) {
     return $resource('/expenses/:id', {id: '@id'}, {
      query: {method:'GET', isArray:true}
     });
  }]);

  app.controller("ExpensesCtrl" , function($scope, Expenses) {

    loadExpenses($scope, Expenses);

    return $scope.addExpense = function() {

      $scope.newExpense.expense_date = $('.date-picker').val();

      Expenses.save({expense: $scope.newExpense});
      $scope.expenses.push($scope.newExpense);
      return $scope.newExpense = {};
    };
  });

  app.controller("SummaryCtrl", function($scope, Expenses) {

    loadExpenses($scope, Expenses);

    $scope.getTotals = function () {
     var totals = [0,0,0,0,0,0,0,0,0,0,0,0];
     for (i = 0; i < $scope.expenses.length; i++){
        var expense = $scope.expenses[i];
        month = expense.date.getMonth();
        totals[month] += expense.amount;
     }
     return [totals];
    }
  });

  app.directive('plot', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var ticks = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

          scope.$watch('expenses', function(newVal, oldVal){
            if (newVal){
               $.jqplot($(element).attr("id"),  scope.getTotals(), {
                series:[{renderer:$.jqplot.BarRenderer

                }],
                axes: {
                  xaxis:{
                    renderer: $.jqplot.CategoryAxisRenderer,
                    ticks: ticks
                  }
                } 
              });
            }
          });
        }
    };
  }); 

}).call(this);


$(document).ready(function(){
  $('.date-picker').datepicker({dateFormat:'dd-mm-yy'});

  $('#upload').submit(function(e){
    e.preventDefault();
    var formData = new FormData(this);
    $.ajax({
      url: '/upload',
      data : formData,
      processData: false,  
      contentType: false,
      method : 'post'
    });
  });
});

function loadExpenses($scope, Expenses){
  Expenses.query(function(response){
    $scope.expenses = response;
    for (i = 0; i < $scope.expenses.length; i++){
      $scope.expenses[i] = $scope.expenses[i].expense;
      $scope.expenses[i].date = new Date($scope.expenses[i].date)
    }
  });
}
