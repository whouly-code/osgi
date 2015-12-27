package com.hck.material.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class QueryServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = -4294381255913216751L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String materialId = req.getParameter("materialId");
		System.out.println("QueryServlet:" + materialId);
		resp.setContentType("text/html");
		ServletOutputStream outputStream = resp.getOutputStream();
		outputStream.println(materialId + "fda");
		
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doGet(req, resp);
	}

}
