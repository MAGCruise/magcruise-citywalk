var JsonRpcRequest = (function() {
  var JsonRpcRequest = function(url, method, params, done, fail) {
    this.url = url;
    this.method = method;
    this.params = params;
    this.done = (done != null) ? done : function(data) {
      console.log(data)
    };
    this.fail = (fail != null) ? fail : function(data, textStatus, errorThrown) {
      console.error(textStatus + ', ' + errorThrown + '. response: ' + JSON.stringify(data));
      console.error('request: ' + JSON.stringify(JSON.stringify(this)));
    };
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
    this.request = request;
  };

  var p = JsonRpcClient.prototype;

  p.setRequest = function(request) {
    this.request = request;
    return this;
  }

  p.rpc = function() {
    var req = JSON.stringify(this.request);
    this.jqXHR = $.ajax({
      type: "POST",
      dataType: "json",
      url: this.request.url,
      data: JSON.stringify({
        method: this.request.method,
        params: this.request.params
      }),
      timeout: this.request.timeout,
    }).done(this.request.done).fail(this.request.fail)
    return this;
  }

  p.schedule = function() {
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
      }).done(client.request.done).fail(
              function(data, textStatus, errorThrown) {
                if (!client.printedError) {
                  console.error(data + ':' + textStatus + ':' + errorThrown + ':'
                          + JSON.stringify(client.request));
                  client.printedError = true;
                }
              }).always(function(data) {
        if (client.isFinish) {
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

  p.loop = function(times) {
    var client = this;
    var callback = this.request.done;
    client.counter = times;
    this.request.done = function(data, status, jqxhr) {
      if (client.counter === 0) {
        client.isFinish = true;
      } else {
        callback(data, status, jqxhr);
        client.counter--;
      }
    }
    return this.schedule()
  }

  p.abort = function() {
    if (this.jqXHR != null) {
      this.jqXHR.abort();
    }
    this.isFinish = true;
  }

  return JsonRpcClient;
})();
