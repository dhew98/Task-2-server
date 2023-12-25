const express=require('express');
const cors=require('cors');
const app = express();
const nodemailer = require('nodemailer');
const port=process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/',(req,res)=>{
    res.send("Server Running");
})


app.use(cors());
app.use(express.json());





const uri = "mongodb+srv://Dhew:123@cluster0.kfnsc.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    //Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //Send a ping to confirm a successful connection
    await client.db("Users").command({ ping: 1 });
   console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const userCollection = client.db("Users").collection("User");

    

    app.get('/insert/:id', async (req, res) =>{
      const id = req.params.id;
      console.log(id);

      const filter={_id:new ObjectId(id)};

      const option = {upsert:true};
      const updateDoc={
        $set:{
          verified:true,
        }
      }
      const result=await userCollection.updateOne(filter,updateDoc,option);
      res.send("Now You can Login!!!");

    })



    app.post('/user', async (req, res) =>{
        console.log(req.body);
        const user= req.body;

        const { email, password } = req.body;


        const result= await userCollection.insertOne(user);
        res.send(result);

        const Id = result.insertedId;
        console.log(Id);

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'jawaddhew98@gmail.com',
            pass: 'awho yfen bywq nddw', 
          },
        });


        const mailOptions = {
          from: 'jawaddhew98@gmail.com',
          to: email,
          subject: 'Activate Your Account',
          text: `Click the following link to activate your account: http://localhost:5000/insert/${Id}`,
        };

      
        transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.error('Error sending activation email', error);
            return res.status(500).json({ error: 'Error sending activation email' });
          }
          else{
            console.log('Activation email sent:', info.response);
            
          }
      
          })


        
    })


    app.post('/login', async (req, res) =>{
      console.log(req.body);


      const { email, password } = req.body;
      console.log(email,password);
      const user = await userCollection.findOne({ email, password });
      const verified=user.verified;
      console.log(verified);
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      if (user && verified) {
        return res.status(200).json({ message: 'Login successful' });
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
     
  })
  }


  catch (error) {
    console.error(error);
  }
 
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log(`Server running on ${port}`);
})