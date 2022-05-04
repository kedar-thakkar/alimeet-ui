import React from 'react';


function NewEditProfile() {

    return (
        <>

            <div class="login_section login_add_info edit_profile_section schedule_a_session">
                <div class="login_bg_img">
                    <img src="images/edit_pofile_bg.jpg" alt="" />
                </div>
                <div class="edit_profile_box_inr">
                    <div class="login_otr">
                        <div class="login_box">
                            <div class="title title_center">
                                <h2>Schedule A Meeting</h2>
                            </div>
                            <div class="form_box">
                                <div class="input_box">
                                    <label>Title</label>
                                    <input type="text" />
                                </div>
                                <div class="input_box">
                                    <label>When</label>
                                    <input type="text" />
                                </div>
                                <div class="input_box">
                                    <label>Participants</label>
                                    <select>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                    </select>
                                </div>
                                <div class="input_box">
                                    <label>Description</label>
                                    <textarea></textarea>
                                </div>
                                <div class="input_box">
                                    <div class="submit_btn">
                                        <a href="#." class="cancel_btn">Cancel</a>
                                        <a href="#." class="save_btn">Save</a>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )

}

export default NewEditProfile;