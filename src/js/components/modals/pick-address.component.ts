import { App } from "../../gogocarto";
import { AppStates } from "../../app.module";
import { getCurrentElementIdShown, getCurrentElementInfoBarShown } from "../element/element-menu.component";

declare var $ : any;

export function openPickAddressModal(element)
{
  let modal = $('#modal-pick-address');
  modal.find(".modal-footer").attr('option-id',element.colorOptionId);      
  
  modal.openModal({
    dismissible: true, 
    opacity: 0.5, 
    in_duration: 300, 
    out_duration: 200,
   });
}
export function initializePickAddress()
{  
  // button to confirm calculate idrections in modal pick address for directions
  $('#modal-pick-address #btn-calculate-directions').click(() => handleDirectionsPickingAddress());
  $('#modal-pick-address input').keyup((e) => { if(e.keyCode == 13) handleDirectionsPickingAddress(); });  
}

function handleDirectionsPickingAddress()
{
  let address = $('#modal-pick-address input').val();
    
  if (address)
  {      
    App.setState(AppStates.ShowDirections,{id: getCurrentElementIdShown()});

    App.geocoder.geocodeAddress(address,
    () => {
      $("#modal-pick-address .modal-error-msg").hide();
      $('#modal-pick-address').closeModal();        
    },
    () => {
      $("#modal-pick-address .modal-error-msg").show();
    });      
  }
  else
  {
    $('#modal-pick-address input').addClass('invalid');
  }
}