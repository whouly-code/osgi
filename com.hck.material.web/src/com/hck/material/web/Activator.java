package com.hck.material.web;

import javax.servlet.Servlet;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceEvent;
import org.osgi.framework.ServiceListener;
import org.osgi.framework.ServiceReference;
import org.osgi.service.http.HttpService;

import com.hck.material.servlet.LoginServlet;
import com.hck.material.servlet.QueryServlet;

public class Activator implements BundleActivator, ServiceListener {

	private static BundleContext context;

	private ServiceReference sr;
	
	private QueryServlet queryServlet;
	private LoginServlet loginServlet;

	static BundleContext getContext() {

		return context;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.osgi.framework.BundleActivator#start(org.osgi.framework.
	 * BundleContext)
	 */
	public void start(BundleContext bundleContext) throws Exception {
		Activator.context = bundleContext;
		queryServlet = new QueryServlet();
		loginServlet = new LoginServlet();
		register();
		context.addServiceListener(this, "(objectClass=" + HttpService.class.getName() + ")");
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.osgi.framework.BundleActivator#stop(org.osgi.framework.BundleContext)
	 */
	public void stop(BundleContext bundleContext) throws Exception {
		unregister();
		Activator.context = null;
		sr = null;
		queryServlet = null;
		loginServlet = null;
	}

	@Override
	public void serviceChanged(ServiceEvent event) {
		switch (event.getType()) {
		case ServiceEvent.REGISTERED:
			register();
			break;
		case ServiceEvent.UNREGISTERING:
			unregister();
			break;
		default:
			break;
		}

	}

	private void register() {
		if (null == sr) {
			sr = context.getServiceReference(HttpService.class.getName());
		}
		if (null != sr) {
			try {
				HttpService hs = (HttpService) context.getService(sr);
				hs.registerServlet("/hck/queryServlet", queryServlet, null, null);
				hs.registerServlet("/hck/loginServlet", loginServlet, null, null);
				hs.registerResources("/hck/material", "WebContent", null);
				System.out.println("注册/hck/material服务资源成功。");
			} catch (Exception e) {
				System.out.println("注册/hck/material服务资源异常。");
				e.printStackTrace();
			}

		}
	}

	private void unregister() {
		if (null != sr) {
			try {
				HttpService hs = (HttpService) context.getService(sr);
				hs.unregister("/hck/queryServlet");
				hs.unregister("/hck/loginServlet");
				hs.unregister("/hck/material");
				System.out.println("注销/hck/material服务资源成功。");
			} catch (Exception e) {
				System.out.println("注销/hck/material服务资源异常。");
				e.printStackTrace();
			}

		}
	}

}
