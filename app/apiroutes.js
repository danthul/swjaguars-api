module.exports = function(app, Article, passport) {
  var express = require("express");
  var router = express.Router(); // get an instance of the express Router
  var moment = require("moment");

  // server routes ===========================================================
  // handle things like api calls
  // ROUTES FOR OUR API
  // =============================================================================

  // middleware to use for all requests
  router.use(function(req, res, next) {
    // do logging
    console.log("Something is happening.");
    next(); // make sure we go to the next routes and don't stop here
  });

  router.get("/getSecretStuff", function(req, res) {
    //for development only TODO create a secure way to get environment variables to client
    res.json({
      GGL_CL_API: process.env.GGL_CALENDAR_API,
      GGL_CL_URL: process.env.GGL_CALENDAR_URL,
      CODE: process.env.CODE
    });
  });
  // on routes that end in /article
  // ----------------------------------------------------
  router
    .route("/articles")
    // create a article (accessed at POST http://localhost:4010/api/articles)
    .post(function(req, res) {
      if (auth) {
        var article = new Article(); // create a new instance of the Article model
        article.name = req.body.name; // set the article name (comes from the request)
        article.body = req.body.body;
        if (req.body.updated) {
          article.updated = moment(req.body.updated, "MM/DD/YYYY hh:mm");
        }

        // save the article and check for errors
        article.save(function(err) {
          if (err) {
            res.send(err);
          }
          res.json({ message: "Message created!", body: article.body });
        });
      } else {
        res.send(401);
      }
    })
    .get(function(req, res) {
      Article.find()
        .sort({ updated: -1 })
        .exec(function(err, article) {
          if (err) {
            res.send(err);
          } else {
            // article.updated = moment(article.updated);
            console.log(article);
            res.json(article);
          }
        });
    });
  // on routes that end in /articles/:article_id
  // ----------------------------------------------------
  router
    .route("/articles/:article_id")
    // get the article with that id (accessed at GET http://localhost:4010/api/articles/:article_id)
    .get(function(req, res) {
      var id = req.params.article_id;

      if (id === "last") {
        Article.find()
          .sort({ updated: -1 })
          .limit(1)
          .exec(function(err, article) {
            if (err) {
              res.send(err);
            } else {
              res.json(article);
            }
          });
      } else {
        Article.findById(id, function(err, article) {
          if (err) {
            res.send(err);
          }
          res.json(article);
        });
      }
    })
    // update the article with this id (accessed at PUT http://localhost:4010/api/article/:article_id)
    .put(function(req, res) {
      if (auth) {
        // use our article model to find the article we want
        Article.findById(req.params.article_id, function(err, article) {
          if (err) {
            res.send(err);
          }
          article.name = req.body.name; // update the article name (comes from the request)
          article.body = req.body.body;
          article.description = req.body.description;
          if (req.body.updated) {
            article.updated = moment(req.body.updated, "MM/DD/YYYY hh:mm");
          }

          // save the article
          article.save(function(err) {
            if (err) {
              res.send(err);
            }
            res.json({ message: "Article updated!" });
          });
        });
      } else {
        res.send(401);
      }
    })
    // delete the article with this id (accessed at DELETE http://localhost:4010/api/articles/:article_id)
    .delete(function(req, res) {
      if (auth) {
        Article.remove(
          {
            _id: req.params.article_id
          },
          function(err, article) {
            if (err) {
              res.send(err);
            }
            res.json({ message: "Successfully deleted" });
          }
        );
      } else {
        res.send(404);
      }
    });

  // on routes that end in /auth
  // ----------------------------------------------------
  router
    .route("/auth/:action")
    // route to test if the user is logged in or not
    .get(function(req, res) {
      if (req.params.action === "loggedin") {
        res.send(req.isAuthenticated() ? req.user : "0");
      }
    });

  // REGISTER OUR ROUTES -------------------------------
  // all of our routes will be prefixed with /api
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
  app.use("/api", router);
};

var auth = function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.send(401);
  } else {
    next();
  }
};
