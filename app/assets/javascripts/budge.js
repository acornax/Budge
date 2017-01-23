(function() {
  var app;

  app = angular.module("Budge", ["ngResource"]);

  app.factory('Transactions', ['$resource', function($resource) {
     return $resource('/transactions/:id', {id: '@id'}, {
      query: {method:'GET', isArray:true},
      delete: {method:'DELETE'}
      });
  }]);


  var zeroPad = function(varToPad){
    return ("0" + varToPad).slice(-2);
  };

  app.controller("TransactionsCtrl" , function($scope, $timeout, Transactions) {

    var startDate = new Date(new Date().getFullYear(), 0, 1);
    $scope.startDate = startDate.getFullYear() + "-" + zeroPad(startDate.getMonth() + 1)+ "-" + zeroPad(startDate.getDate());
    var endDate = new Date(new Date().getFullYear(), 0, 365);
    $scope.endDate = endDate.getFullYear() + "-" + zeroPad(endDate.getMonth() + 1)+ "-" + zeroPad(endDate.getDate());

    $scope.transactions = []
    queryTransactions($scope, Transactions);

    $scope.$watchCollection("transactions", function(){
      $scope.dateFilterTransactions();
    });

    $scope.addTransaction = function() {

      $scope.newTransaction.transaction_date = $('#new-transaction-date-picker').val();

      Transactions.save({transaction: $scope.newTransaction}, function(response,getResponseHeaders){
        var transactionToAdd = response.transaction;
        transactionToAdd.date = new Date(transactionToAdd.date);
        $scope.transactions.push(transactionToAdd);
        $('#new-transaction-date-picker').val('');
      });

      return $scope.newTransaction = {};
    };

    $scope.destroyTransaction = function(id){
     var transaction = _.find($scope.transactions, function(exp){
      return exp.id == id;
     });
     var index  = $scope.transactions.indexOf(transaction);
     Transactions.delete({id: transaction.id});
     $scope.transactions.splice(index, 1);
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
            loadTransactions($scope, JSON.parse(xhr.responseText));
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

    $scope.dateFilterTransactions = function () {
      var startTime = new Date($scope.startDate).getTime();
      var endTime = new Date($scope.endDate).getTime();

      var newDateFilteredTransactions = [];

      for (i = 0; i < $scope.transactions.length; i++){
        var transactionDate = new Date($scope.transactions[i].date);

        // Filter includes 1. the date, and 2. the search filter
        if (transactionDate.getTime() >= startTime && transactionDate.getTime() <= endTime){
          newDateFilteredTransactions.push($scope.transactions[i]);
        }
      }

      // Only trigger a scope update if the list of transactions to show has actually changed. 
      if ($scope.dateFilteredTransactions == undefined || _.isEqual($scope.dateFilteredTransactions, newDateFilteredTransactions) == false ){
        $scope.dateFilteredTransactions = newDateFilteredTransactions;
      }
    };

    $scope.getIncomeTotals = function () {
     var totals = [0,0,0,0,0,0,0,0,0,0,0,0];
     var total = 0;
     for (i = 0; i < $scope.fullyFilteredTransactions.length; i++){
        var transaction = $scope.fullyFilteredTransactions[i];
        month = transaction.date.getMonth();
        if (transaction.amount > 0){
          totals[month] += transaction.amount;
          total += transaction.amount;
        }
     }
     $scope.totalIncome = Math.ceil(total);
     return totals;
    };

    $scope.getExpenseTotals = function () {
     var totals = [0,0,0,0,0,0,0,0,0,0,0,0]
     var total = 0;
     for (i = 0; i < $scope.fullyFilteredTransactions.length; i++){
        var transaction = $scope.fullyFilteredTransactions[i];
        month = transaction.date.getMonth();
        if (transaction.amount < 0){
          totals[month] -= transaction.amount;
          total -= transaction.amount;
        } 
     }
     $scope.totalSpending = Math.ceil(total);
     return totals;
    };

    $scope.getNetIncomeTotals = function () {
     var totals = [0,0,0,0,0,0,0,0,0,0,0,0];
     var total = 0;
     for (i = 0; i < $scope.fullyFilteredTransactions.length; i++){
        var transaction = $scope.fullyFilteredTransactions[i];
        month = transaction.date.getMonth();
        totals[month] += transaction.amount;
        total += transaction.amount;
     }
     $scope.totalNetIncome = Math.ceil(total);
     return totals;
    };
  });

  var plot;

  app.directive('plot', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var ticks = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

          var options = {
                        series: [{renderer:$.jqplot.BarRenderer}, {renderer:$.jqplot.BarRenderer}, {renderer:$.jqplot.BarRenderer}],
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
                        }
                      };
          scope.$watchCollection('fullyFilteredTransactions', function(newVal, oldVal){
            if (newVal && plot){
               plot.destroy();
            } 
            if (newVal){
               plot = $.jqplot($(element).attr("id"),  [scope.getIncomeTotals(), scope.getExpenseTotals(), scope.getNetIncomeTotals()], options);
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
          scope.dateFilterTransactions();
          scope.$apply();
        }
      });
    }
  };

});


var transactionsTable;
app.directive('transactionTable', function($timeout, $filter){
  return function(scope, element, attrs){
    scope.$watchCollection('dateFilteredTransactions', function(newTransactions, oldTransactions){
      var searchVal = $("input[type='search'").val() || "";
      var order;

      if (transactionsTable){
        order = transactionsTable.order();
        transactionsTable.destroy();
      }
      if (newTransactions && oldTransactions == undefined || newTransactions){
        transactionsTable = $('#transaction-table').DataTable({
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
                return '<div class = "delete btn small green" onclick="angular.element(this).scope().destroyTransaction('+full.id+')">Delete</div>';
              }
            }
          ],
          data:newTransactions
        });   

        transactionsTable.on('search.dt', function(){
          $timeout(function() {
            scope.fullyFilteredTransactions = transactionsTable.rows( { search:'applied' } ).data();
            scope.$apply();
          });
        });
        if (order){
          transactionsTable.order(order);
        }

        transactionsTable.search(searchVal).draw();

      }
    });
  };
});

}).call(this);


$(document).ready(function(){
  $('#new-transaction-date-picker').datepicker({dateFormat:'dd-mm-yy'});

  $('#file_wrapper').on('click', function(){
    $('#file').trigger("click");
  });

  $('#file').on('change', function(){
    $('#file_name').html(this.files[0].name);
    $('#file_name_container').removeClass('hidden');
  });

});

function queryTransactions($scope, Transactions){
  Transactions.query(function(response){
    loadTransactions($scope, response);
  });
}

function loadTransactions($scope, transactions){
    for (i = 0; i < transactions.length; i++){
      var transactionDate = new Date(transactions[i].transaction.date);
      transactions[i] = transactions[i].transaction;
      transactions[i].date = transactionDate;
    }
    $scope.transactions = _.union($scope.transactions, transactions);
    $scope.dateFilterTransactions();
    $scope.fullyFilteredTransactions = $scope.dateFilteredTransactions;
}
