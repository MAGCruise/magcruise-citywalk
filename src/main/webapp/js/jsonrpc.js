var JsonRpcRequest = (function() {
  var JsonRpcRequest = function(url, method, params, done, fail) {
    this.url = url;
    this.method = method;
    this.params = params;
    this.done = getDefaultDoneIfAbsent(done);
    this.fail = getDefaultFailIfAbsent(fail);
    this.delay = 1000;
    this.initialDelay = 0;
    this.timeout = 60000;
  };

  return JsonRpcRequest;
})();

var JsonRpcClient = (function() {

  var JsonRpcClient = function(request) {
    this.jqXHR = null;
    this.isFinish = false;
    // Does the request is success at least once;
    this.isSuccess = false;
    this.request = request;
  };

  var p = JsonRpcClient.prototype;

  p.setRequest = function(request) {
    this.request = request;
    return this;
  }

  p.rpc = function() {
    var req = JSON.stringify(this.request);
    var client = this;
    this.jqXHR = $.ajax({
      type: "POST",
      dataType: "json",
      url: this.request.url,
      data: JSON.stringify({
        method: this.request.method,
        params: this.request.params
      }),
      timeout: this.request.timeout,
    }).done(function(data, status, jqxhr) {
      client.request.done(data, status, jqxhr);
      client.isSuccess = true
    }).fail(this.request.fail)
    return this;
  }

  p.schedule = function(success, unsuccess) {
    success = getDefaultDoneIfAbsent(success);
    unsuccess = getDefaultFailIfAbsent(unsuccess);

    var client = this;
    client.printedError = false;

    function refresh() {
      client.jqXHR = $.ajax({
        type: "POST",
        dataType: "json",
        url: client.request.url,
        data: JSON.stringify({
          method: client.request.method,
          params: client.request.params
        }),
        timeout: client.request.timeout,
      }).done(function(data, status, jqxhr) {
        client.request.done(data, status, jqxhr);
        client.isSuccess = true;
      }).fail(
              function(data, textStatus, errorThrown) {
                if (!client.printedError) {
                  console.error(data + ':' + textStatus + ':' + errorThrown + ':'
                          + JSON.stringify(client.request));
                  client.printedError = true;
                }
              }).always(function(data) {
        if (client.isFinish) {
          if (client.isSuccess) {
            success();
          } else {
            unsuccess();
          }

          if (client.jqXHR != null) {
            client.jqXHR.abort();
          }
        } else {
          client.jqXHR = null;
          setTimeout(function() {
            refresh();
          }, client.request.delay);
        }
      });
    }
    if (client.request.initialDelay == null) {
      client.request.initialDelay = 0;
    }
    setTimeout(function() {
      refresh();
    }, client.request.initialDelay);
    return client;
  }

  p.repeat = function(times, success, unsuccess) {
    var client = this;
    var callback = this.request.done;
    client.counter = times;
    this.request.done = function(data, status, jqxhr) {
      if (client.counter === 0) {
        client.isFinish = true;
      } else {
        callback(data, status, jqxhr);
        client.isSuccess = true;
        client.counter--;
      }
    }
    return this.schedule()
  }

  p.retry = function(times, success, unsuccess) {
    var client = this;
    var callback = this.request.done;
    client.counter = times;
    this.request.done = function(data, status, jqxhr) {
      callback(data, status, jqxhr);
      client.isSuccess = true;
      client.isFinish = true;
    }
    return this.schedule(success, unsuccess);
  }

  p.abort = function() {
    if (this.jqXHR != null) {
      this.jqXHR.abort();
    }
    this.isFinish = true;
  }

  return JsonRpcClient;
})();

function getDefaultDoneIfAbsent(done) {
  return (done != null) ? done : function(data) {
    console.log(data)
  };
}

function getDefaultFailIfAbsent(fail) {
  return (fail != null) ? fail : function(data, textStatus, errorThrown) {
    console.error(textStatus + ', ' + errorThrown + '. response: ' + JSON.stringify(data));
    console.error('request: ' + JSON.stringify(JSON.stringify(this)));
  };
}