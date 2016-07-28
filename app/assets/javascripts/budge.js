(function() {
  var app;

  app = angular.module("Budge", ["ngResource"]);

  app.factory('Expenses', ['$resource', function($resource) {
     return $resource('/expenses/:id', {id: '@id'}, {
      query: {method:'GET', isArray:true}
     });
  }]);


  var zeroPad = function(varToPad){
    return ("0" + varToPad).slice(-2);
  };

  app.controller("ExpensesCtrl" , function($scope, $timeout, Expenses) {

    var startDate = new Date(new Date().getFullYear(), 0, 1);
    $scope.startDate = startDate.getFullYear() + "-" + zeroPad(startDate.getMonth() + 1)+ "-" + zeroPad(startDate.getDate());
    var endDate = new Date();
    $scope.endDate = endDate.getFullYear() + "-" + zeroPad(endDate.getMonth() + 1)+ "-" + zeroPad(endDate.getDate());

    queryExpenses($scope, Expenses);

    $scope.addExpense = function() {

      $scope.newExpense.expense_date = $('#new-expense-date-picker').val();

      Expenses.save({expense: $scope.newExpense}, function(response,getResponseHeaders){
        var expenseToAdd = response.expense;
        expenseToAdd.date = new Date(expenseToAdd.date);
        $scope.expenses.push(expenseToAdd);
        $('#new-expense-date-picker').val('');
      });

      return $scope.newExpense = {};
    };

    $scope.destroyExpense = function(id){
     var expense = _.find($scope.expenses, function(exp){
      return exp.id == id;
     });
     var index  = $scope.expenses.indexOf(expense);
     Expenses.delete({id: expense.id});
     $scope.expenses.splice(index, 1);
    };

    $scope.upload = function(){
      var form = $('#upload')[0];
      var formData = new FormData(form);
      $.ajax({
        xhr: function(){
          var xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener('progress', function(e){
            if (e.lengthComputable){
              var percentComplete = e.loaded/e.total;
              $('#progress').removeClass('hidden');
              $('#progress_text').html(percentComplete + "%");
            }
          }, false);
          return xhr;
        },
        url: '/upload',
        data : formData,
        processData: false,  
        contentType: false,
        method : 'post',
        complete: function(xhr){
          $timeout(function() {
            loadExpenses($scope, JSON.parse(xhr.responseText));
          });
          $('#progress_text').html("100%");
          setTimeout(function(){
            $('#progress').addClass('hidden');
            $('#upload_link').removeClass('hidden');
          }, 2000);
        }
      });
      $('#upload_link').addClass('hidden');
    };

    $scope.filterExpenses = function () {
      var startTime = new Date($scope.startDate).getTime();
      var endTime = new Date($scope.endDate).getTime();

      var filteredExpenses = [];

      for (i = 0; i < $scope.expenses.length; i++){
        var expenseDate = new Date($scope.expenses[i].date);

        if (expenseDate.getTime() > startTime && expenseDate.getTime() < endTime){
          filteredExpenses.push($scope.expenses[i]);
        }
      }
      $scope.filteredExpenses = filteredExpenses;
    };

    $scope.getTotals = function () {
     var totals = [0,0,0,0,0,0,0,0,0,0,0,0];
     for (i = 0; i < $scope.filteredExpenses.length; i++){
        var expense = $scope.filteredExpenses[i];
        month = expense.date.getMonth();
        totals[month] += expense.amount;
     }
     return [totals];
    };
  });

  var plot;

  app.directive('plot', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var ticks = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

          var options = {
                        series: [{renderer:$.jqplot.BarRenderer}],
                        axes: {
                          xaxis:{
                            renderer: $.jqplot.CategoryAxisRenderer,
                            ticks: ticks
                          },
                          yaxis:{
                            tickOptions:{
                              formatString:'$%d'
                              }
                          }
                        },
                        highlighter: {
                                show: true,
                                sizeAdjust: 7.5,
                                tooltipAxes:'y'
                        },
                      };
          scope.$watchCollection('filteredExpenses', function(newVal, oldVal){
            if (newVal && plot){
               plot.destroy();
            } 
            if (newVal){
               scope.filterExpenses(); //FIXME, shouldn't need this.
               plot = $.jqplot($(element).attr("id"),  scope.getTotals(), options);
            }
          });
        }
    };
  });

app.directive('datepicker', function(){
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs){
      $(element).datepicker({
        dateFormat: "yy-mm-dd", 
        onSelect: function(date){
          scope[attrs.ngModel] = date;
          scope.filterExpenses();
          scope.$apply();
        }
      });
    }
  };

});


var expensesTable;
app.directive('expenseTable', function($timeout, $filter){
  return function(scope, element, attrs){
    scope.$watchCollection('filteredExpenses', function(newExpenses, oldExpenses){
      var searchVal = $("input[type='search'").val() || "";
      var order;
      if (newExpenses && expensesTable){
        order = expensesTable.order();
        expensesTable.destroy();
      }
      if (newExpenses){
        expensesTable = $('#expense-table').DataTable({
          "search": {
            regex: true,
            smart: false,
            stateSave: true
          },
          columns:[
            {"data":"amount"},
            {"data":"info"},
            {"data":"date", "render" : function(data, type, full, meta){
                return $filter('date')(data, 'longDate');
              }
            },
            {"render" : function(data, type, full, meta){
                return '<div class = "delete btn small green" onclick="angular.element(this).scope().destroyExpense('+full.id+')">Delete</div>';
              }
            }
          ],
          data:newExpenses
        });   

        expensesTable.on('search.dt', function(){
          $timeout(function() {
            scope.filteredExpenses = expensesTable.rows( { search:'applied' } ).data();
          });
        });
        if (order){
          expensesTable.order(order);
        }

        expensesTable.search(searchVal).draw();

      }
    });
  };
});

}).call(this);


$(document).ready(function(){
  $('#new-expense-date-picker').datepicker({dateFormat:'dd-mm-yy'});

  $('#file_wrapper').on('click', function(){
    $('#file').trigger("click");
  });

  $('#file').on('change', function(){
    $('#file_name').html(this.files[0].name);
    $('#file_name_container').removeClass('hidden');
  });

});

function queryExpenses($scope, Expenses){
  Expenses.query(function(response){
    loadExpenses($scope, response);
  });
}

function loadExpenses($scope, expenses){
    for (i = 0; i < expenses.length; i++){
      var expenseDate = new Date(expenses[i].expense.date);
      expenses[i] = expenses[i].expense;
      expenses[i].date = expenseDate;
    }
    $scope.expenses = expenses;
    $scope.filterExpenses();
}
