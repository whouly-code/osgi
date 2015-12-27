package com.hck.material.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.hck.material.user.UserService;

public class LoginServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 464319051149632490L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		System.out.println("��ʼ��¼");
		String userName = req.getParameter("userName");
		String passWord = req.getParameter("passWord");
		System.out.println("��¼�û�:" + userName);
		UserService userService = new UserService();
		int userId = userService.checkUser(userName, passWord);
		ServletOutputStream outputStream = resp.getOutputStream();
//		outputStream.write("�û��¹���".getBytes("utf-8"));
		outputStream.print(userId);
		resp.setCharacterEncoding("UTF-8");
		resp.setHeader("Content-type","text/html;charset=UTF-8");
//		resp.setContentType("text/html");

//		resp.setStatus(200);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doGet(req, resp);
	}

}
