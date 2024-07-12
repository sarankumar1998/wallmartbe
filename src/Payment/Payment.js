const express = require("express");
const router = new express.Router();
const Razorpay = require("razorpay");
const instance = new Razorpay({
    key_id: 'rzp_test_VylokSbwRrBULv',
    key_secret: 'tUQZYwXaHtGgLACwsXsAwbQY',
});

router.get("/order", (req, res) => {
    try {
      const options = {
        amount: 20 * 100, // amount == Rs 10
        currency: "INR",
        receipt: "receipt#1",
        payment_capture: 0,
   // 1 for automatic capture // 0 for manual capture
      };
    instance.orders.create(options, async function (err, order) {
      if (err) {
        return res.status(500).json({
          message: "Something Went Wrong",
        });
      }
    return res.status(200).json(order);
   });
  } catch (err) {
    return res.status(500).json({
      message: "Something Went Wrong",
    });
   }
  });

  router.post("/capture/:paymentId", (req, res) => {
    try {
      return request(
       {
       method: "POST",
       url: `https://${rzp_test_VylokSbwRrBULv}:${tUQZYwXaHtGgLACwsXsAwbQY}@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
       form: {
          amount: 10 * 100, // amount == Rs 10 // Same As Order amount
          currency: "INR",
        },
      },
     async function (err, response, body) {
       if (err) {
        return res.status(500).json({
           message: "Something Went Wrong",
         }); 
       }
        console.log("Status:", response.statusCode);
        console.log("Headers:", JSON.stringify(response.headers));
        console.log("Response:", body);
        return res.status(200).json(body);
      });
    } catch (err) {
      return res.status(500).json({
        message: "Something Went Wrong",
     });
    }
  });

  module.exports = router;