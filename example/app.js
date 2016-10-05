/**
 * Created by mobinni on 22/04/15.
 */
var app = angular.module('exampleApp', [
    'materialDatePicker'
]);

app.controller('MainCtrl', function ($scope) {
    $scope.date = moment().toDate();
    $scope.header = {
        monday: 'Mon',
        tuesday: 'Tue',
        wednesday: 'Wed',
        thursday: 'Thu',
        friday: 'Fri',
        saturday: 'Sat',
        sunday: 'Sun',
    }
    $scope.dateChanged = function () {
        console.log('it changed!', $scope.date);
    }
})
