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

    $scope.addExpense = function() {

      $scope.newExpense.expense_date = $('.date-picker').val();

      Expenses.save({expense: $scope.newExpense}, function(u,getResponseHeaders){
        $scope.expenses.push($scope.newExpense);
        $('.date-picker').val('');
        pulseElement($('#summary_link'));
      });

      return $scope.newExpense = {};
    };

    $scope.upload = function(){
      var form = $('#upload')[0];
      var formData = new FormData(form);
      $.ajax({
        url: '/upload',
        data : formData,
        processData: false,  
        contentType: false,
        method : 'post'
      });
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

  $('#file_wrapper').on('click', function(){
    $('#file').trigger("click");
  });

  $('#file').on('change', function(){
    $('#file_name').html(this.files[0].name);
    $('#file_name_container').removeClass('hidden');
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

function pulseElement($el){
  $el.addClass('success');
  setTimeout(function(){
    $el.removeClass('success');
  }, 8000);
}
