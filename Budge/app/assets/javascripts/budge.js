(function() {
  var app;

  app = angular.module("Budge", ["ngResource"]);

  app.factory('Expenses', function() {
       return [{amount: 1, date: new Date("5/13/2013")}, {amount: 10, date: new Date("11/13/2013")}, {amount: 2, date: new Date("12/03/2013")}]
  });

  app.controller("ExpensesCtrl" , function($scope, Expenses) {

    $scope.expenses = Expenses;

    return $scope.addExpense = function() {
      var expense;

      $scope.newExpense.expense_date = $('.date-picker').val();

      expense = Expense.save({expense: $scope.newExpense});
      $scope.expenses.push($scope.newExpense);
      return $scope.newExpense = {};
    };
  });

  app.controller("SummaryCtrl", function($scope, Expenses) {

    $scope.expenses = Expenses;

    $scope.getTotals = function () {
     var totals = [0,0,0,0,0,0,0,0,0,0,0,0];
     for (i = 0; i < $scope.expenses.length; i++){
        month = $scope.expenses[i].date.getMonth();
        totals[month] += $scope.expenses[i].amount;
     }
     return [totals];
    }
  });

  app.directive('plot', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var ticks = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
    };
  }); 

}).call(this);


$(document).ready(function(){
  $('.date-picker').datepicker();
});
