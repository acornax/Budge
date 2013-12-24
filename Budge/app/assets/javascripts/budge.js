(function() {
  var app;

  app = angular.module("Budge", ["ngResource"]);

  this.ExpensesCtrl = function($scope, $resource) {
    var Expense;

    Expense = $resource("/expenses/:id", {id: "@id"}, {update: { method: "PUT"}});

    $scope.expenses = Expense.query();
    return $scope.addExpense = function() {
      var expense;

      $scope.newExpense.expense_date = $('.date-picker').val();

      expense = Expense.save({expense: $scope.newExpense});
      $scope.expenses.push($scope.newExpense);
      return $scope.newExpense = {};
    };
  };

  this.SummaryCtrl = function($scope, $resource) {

    var Expense = $resource('expenses/:id', {id: "@id"}, {update : {method : "PUT"}});
    $scope.expenses = Expense.query();
  };

}).call(this);


$(document).ready(function(){
  $('.date-picker').datepicker();
});
