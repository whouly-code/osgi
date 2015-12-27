package com.hck.material.user;


public class UserService implements IUserService {

	@Override
	public int checkUser(String userName, String passWord) {
		if("hck".equalsIgnoreCase(userName)){
			return 1000;
		}
		return 0;
	}

}
