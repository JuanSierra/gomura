angular.module('Gomura', ['ngResource', 'ngRoute', 'ngWebSocket', 'ngDialog'])
.config(function ($routeProvider) {
    $routeProvider
	.when('/', {
	    templateUrl: 'views/home.ejs',
	    controller: 'ctrl'
	})
	.when('/room/:roomName', {
	    templateUrl: 'views/room.ejs',
	    controller: 'ctrl2'
	})
    /*.when('/ciudades/create', {
    templateUrl: 'views/create.ejs',
    controller: 'ctrl_create'
    })*/
	.otherwise({
	    redirectTo: '/'
	});
})
.config(['ngDialogProvider', function (ngDialogProvider) {
    ngDialogProvider.setDefaults({
        className: 'ngdialog-theme-default',
        plain: true,
        showClose: true,
        closeByDocument: true,
        closeByEscape: true,
        appendTo: '.pure-u-2-3',
        overlay: false,
        disableAnimation: true,
        preCloseCallback: function () {
            console.log('default pre-close callback');
        }
    });
} ])
.factory('MyData', function ($websocket) {
    // Open a WebSocket connection
    var dataStream = $websocket('ws://localhost:8000');

    var collection = [];

    dataStream.onMessage(function (message) {
        var data = JSON.parse(message.data);

        if (data.type == 'newUser') {
            collection.push(data.content);
        }
    });

    var methods = {
        collection: collection,
        get: function () {
            dataStream.send(JSON.stringify({ action: 'get' }));
        }
    };

    return methods;
})
.factory('shared', function () {
    var savedData = {}

    function set(data) {
        savedData = data;
    }
    function get() {
        return savedData;
    }

    return {
        set: set,
        get: get
    }
})
.factory('get_rooms', ['$resource', function ($resource) {
    return $resource('/api/rooms', {}, {
        get: { method: 'GET', isArray: true }
    });
} ])
.factory('create_room', ['$resource', function ($resource) {
    return $resource('/api/rooms', {}, {
        save: { method: 'POST' }
    });
} ])
.factory('join_room', ['$resource', function ($resource) {
    return $resource('/api/room/:room/:user', { room: '@room', user: '@user' }, {
        save: { method: 'POST' }
    });
} ])
.factory('get_room', ['$resource', function ($resource) {
    return $resource('/api/room/:room', { room: '@room' }, {
        get: { method: 'GET' }
    });
} ])
/*
.factory('service_delete', ['$resource', function($resource){
return $resource('/ciudades/save/:id',  {id:'@id'}, {
delete: { method: 'DELETE'}
});
}])
.factory('service_get', ['$resource', function($resource){
return $resource('/ciudad/:id', {id:'@id'}, {
get: { method:'GET', isArray:false }
});
}])*/
.controller('ctrl', ['$scope', '$location', 'get_rooms', 'create_room', 'join_room', 'get_room', 'shared', 'ngDialog', function ($scope, $location, get_rooms, create_room, join_room, get_room, shared, ngDialog) {
    get_rooms.get({}, function (data) {
        $scope.rooms = data;
        $scope.size = data.length;
    });

    $scope.newRoom = function () {
        $scope.room.game = { 'f1': '123', 'f2': '357' };
        create_room.save($scope.room);
        var name = $scope.room.name;
        $scope.room = {};

        get_rooms.get({}, function (response) {
            $scope.rooms = response;
        });

        $location.path('/room/' + name);
        //var new_dialog = ngDialog.open({ id: 'fromAService', template: 'firstDialogId', controller: 'ctrl', data: { foo: 'from a service'} });

    }

    $scope.joinRoom = function (user) {
        join_room.save(
            { room: $scope.selectedRoom.name, user: user },
			function (res) {
			    if (res.message == 'User Added') {
			        shared.set('pepo');
			        //$window.location.href = '/room/'+$scope.selectedRoom;
			        $location.path('/room/' + $scope.selectedRoom.name); //.href = '/room/'+$scope.selectedRoom;
			    }
			},
			function (error) {
			    console.log(error)
			}
		);
    }

    /*$scope.selectRoom = function(room){
    $scope.selectedRoom = room;
    }*/
    /*
    $scope.saveEntry = function(){
    service_update.save($scope.ciudad);
    }
	
    $scope.deleteEntry = function(id){
    $scope.message = service_delete.delete({id:id});
    }
	
    $scope.get = function(id){
    console.log('invocado ' + id)
    $scope.ciudad_ed  = service_get.get({id:id});
    }*/
} ])
.controller('ctrl2', ['$scope', '$routeParams', 'get_room', 'shared', 'MyData', function ($scope, $routeParams, get_room, shared, MyData) {
    $scope.roomName = $routeParams.roomName;
    //console.log($routeParams.roomName);
    /*$scope.$on('$routeChangeSuccess', function() {
    console.log($routeParams.roomName);
    });*/


    get_room.get({ room: $scope.roomName }, function (response) {
        $scope.categories = response.categories;
        console.log(response)
        $scope.users = response.users;
    });

    $scope.MyData = MyData;
} ]);