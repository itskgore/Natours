const stripe = Stripe('pk_test_62oxlTG3huQ9xOwY3TTweZuA00blaNUW9v');
import axios from 'axios';
import { showAlert } from './alert';
export const bookTour = async tourId => {
  try {
    //1) get the checkout session from server endpoint / API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    //2) Create checkout form + charge credit card for us
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert('error', err);
  }
};
