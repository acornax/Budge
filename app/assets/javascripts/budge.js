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

    $scope.destroyExpense = function(expense, index){
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
        complete: function(){
          $('#progress_text').html("100%");
          pulseElement($('#summary_link'));
          setTimeout(function(){
            $('#progress').addClass('hidden');
            $('#upload_link').removeClass('hidden');
          }, 2000);
        }
      });
      $('#upload_link').addClass('hidden');
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
  }, 16000);
}
