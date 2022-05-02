App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
  
    init: function() {
      return App.initWeb3();
    },
  
    initWeb3: function() {
      if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
      }
      return App.initContract();
    },
  
    initContract: function() {
      $.getJSON("Election.json", function(election) {
        // Instantiate a new truffle contract from the artifact
        App.contracts.Election = TruffleContract(election);
        //console.log("tc- ",App.contracts.Election);
        // Connect provider to interact with contract
        App.contracts.Election.setProvider(App.web3Provider);
  
        App.listenForEvents();
  
        return App.render();
      });
    },
  
    listenForEvents: function() {
      App.contracts.Election.deployed().then(function(instance) {
        instance.votedEvent({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {
          console.log("event triggered", event)
          // Reload when a new vote is recorded
          App.render();
        });
      });
    },
  
    render: function() {
      var electionInstance;
      var loader = $("#loader");
      var content = $("#content");
      loader.show();
      content.hide();
  
      // Load account data
      web3.eth.getCoinbase(function(err, account) {
        if (err === null) {
          console.log("no error ",account);
          App.account = account;
          $("#accountAddress").html("Your Account: " + account);
        }
        else{
          console.log("error");
          $("#accountAddress").html("Your Account: " + "Default");
        }
      });
  
      // Load contract data
      App.contracts.Election.deployed().then(function(instance) {
        electionInstance = instance;
        return electionInstance.candidatesCount();
      }).then(function(candidatesCount) {
        var BJPvote = $("#v1");
        BJPvote.empty();

        var AAPvote = $("#v2");
        AAPvote.empty();

        var Congressvote = $("#v3");
        Congressvote.empty();
  
        var candidatesSelect = $('#candidatesSelect');
        candidatesSelect.empty();
  

          electionInstance.candidates(1).then(function(candidate) {
            var id = candidate[0];
            var name = candidate[1];
            var voteCount = candidate[2];
  
            // Render candidate Result
            var candidateTemplate = "<p> Votes:" + voteCount + "</p>"
            BJPvote.append(candidateTemplate);
  
             // Render candidate ballot option
            var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
            candidatesSelect.append(candidateOption);
          });

          electionInstance.candidates(2).then(function(candidate) {
            var id = candidate[0];
            var name = candidate[1];
            var voteCount = candidate[2];
  
            // Render candidate Result
            var candidateTemplate = "<p> Votes:" + voteCount + "</p>"
            AAPvote.append(candidateTemplate);
  
             // Render candidate ballot option
            var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
            candidatesSelect.append(candidateOption);
          });

          electionInstance.candidates(3).then(function(candidate) {
            var id = candidate[0];
            var name = candidate[1];
            var voteCount = candidate[2];
  
            // Render candidate Result
            var candidateTemplate = "<p> Votes:" + voteCount + "</p>"
            Congressvote.append(candidateTemplate);
  
             // Render candidate ballot option
            var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
            candidatesSelect.append(candidateOption);
          });

        return electionInstance.voters(App.account);
        }).then(function(hasVoted) {
          // Do not allow a user to vote
          if(hasVoted) {
            $('form').hide();
          }
        loader.hide();
        content.show();
      }).catch(function(error) {
        console.warn(error);
      });
    },
    castVote: function() {
      var candidateId = $('#candidatesSelect').val();
      App.contracts.Election.deployed().then(function(instance) {
        return instance.vote(candidateId, { from: App.account });
      }).then(function(result) {
        // Wait for votes to update
        $("#content").hide();
        $("#loader").show();
      }).catch(function(err) {
        console.error(err);
      });
    },
  
  };
  
  $(function() {
    $(window).load(function() {
      console.log("Started");
      App.init();
    });
  });